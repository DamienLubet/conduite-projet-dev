import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import ProjectMemberSettings from './ProjectMemberSettings';

const mocks = vi.hoisted(() => ({
    addProjectMember: vi.fn(),
    removeProjectMember: vi.fn(),
    changeProjectMemberRole: vi.fn(),
    getProjectById: vi.fn(),
    setProject: vi.fn(),
}));

vi.mock('../../api/projectApi', () => ({
    projectApi: () => ({
        addProjectMember: mocks.addProjectMember,
        removeProjectMember: mocks.removeProjectMember,
        changeProjectMemberRole: mocks.changeProjectMemberRole,
        getProjectById: mocks.getProjectById,
    }),
}));

describe('ProjectMemberSettings Component', () => {
    const mockProject = {
        _id: 'proj123',
        members: [
            {
                _id: 'mem1',
                userID: { _id: 'user1', username: 'Alice', email: 'alice@test.com' },
                role: 'Scrum Master'
            },
            {
                _id: 'mem2',
                userID: { _id: 'user2', username: 'Bob', email: 'bob@test.com' },
                role: 'Developer'
            }
        ]
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    const renderComponent = (project = mockProject) => {
        render(
            <ProjectMemberSettings 
                project={project} 
                setProject={mocks.setProject} 
            />
        );
    };

    test('renders the invite form and member list correctly', () => {
        renderComponent();

        expect(screen.getByPlaceholderText(/username or email/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /invite/i })).toBeInTheDocument();
        
        expect(screen.getByText('Alice')).toBeInTheDocument();
        expect(screen.getByText('Bob')).toBeInTheDocument();
        expect(screen.getAllByRole('combobox').length).toBeGreaterThan(1); 
    });

    test('handles sending an invitation successfully', async () => {
        renderComponent();
        const user = userEvent.setup();

        mocks.addProjectMember.mockResolvedValueOnce({
            success: true,
            project: { 
                members: [...mockProject.members, { userID: { username: 'Charlie' }, role: 'Viewer' }] 
            }
        });

        await user.type(screen.getByPlaceholderText(/username or email/i), 'Charlie');
        
        const inviteSelect = screen.getAllByRole('combobox')[0]; 
        await user.selectOptions(inviteSelect, 'Viewer');

        await user.click(screen.getByRole('button', { name: /invite/i }));

        expect(mocks.addProjectMember).toHaveBeenCalledWith(
            'proj123', 
            { username: 'Charlie', role: 'Viewer' }
        );
        expect(mocks.setProject).toHaveBeenCalled();
    });

    test('handles invitation error', async () => {
        renderComponent();
        const user = userEvent.setup();

        mocks.addProjectMember.mockRejectedValueOnce(new Error('User not found'));

        await user.type(screen.getByPlaceholderText(/username or email/i), 'UnknownUser');
        await user.click(screen.getByRole('button', { name: /invite/i }));

        await waitFor(() => {
            expect(screen.getByText('User not found')).toBeInTheDocument();
        });
        expect(mocks.setProject).not.toHaveBeenCalled();
    });

    test('handles changing a member role', async () => {
        renderComponent();
        const user = userEvent.setup();

        mocks.changeProjectMemberRole.mockResolvedValueOnce({ success: true });

        const bobRow = screen.getByText('Bob').closest('li');
        const roleSelect = within(bobRow).getByRole('combobox');

        await user.selectOptions(roleSelect, 'Scrum Master');

        expect(mocks.changeProjectMemberRole).toHaveBeenCalledWith(
            'proj123',
            { email: 'bob@test.com', newRole: 'Scrum Master' }
        );
        expect(mocks.setProject).toHaveBeenCalled();
    });

    test('handles removing a member', async () => {
        renderComponent();
        const user = userEvent.setup();

        mocks.removeProjectMember.mockResolvedValueOnce({ success: true });

        const aliceRow = screen.getByText('Alice').closest('li');
        const removeButton = within(aliceRow).getByRole('button', { name: /remove/i });

        await user.click(removeButton);

        expect(mocks.removeProjectMember).toHaveBeenCalledWith(
            'proj123',
            { email: 'alice@test.com' }
        );
        expect(mocks.setProject).toHaveBeenCalled();
    });

    test('handles invite with email address correctly', async () => {
        renderComponent();
        const user = userEvent.setup();

        mocks.addProjectMember.mockResolvedValueOnce({ success: true, project: {} });

        await user.type(screen.getByPlaceholderText(/username or email/i), 'new@test.com');
        await user.click(screen.getByRole('button', { name: /invite/i }));

        expect(mocks.addProjectMember).toHaveBeenCalledWith(
            'proj123',
            { email: 'new@test.com', role: 'Developer' } 
        );
    });
});