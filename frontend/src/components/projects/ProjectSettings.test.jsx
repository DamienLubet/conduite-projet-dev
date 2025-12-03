import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import ProjectSettings from './ProjectSettings';

const mocks = vi.hoisted(() => ({
    navigate: vi.fn(),
    useOutletContext: vi.fn(),
    setProject: vi.fn(),
}));

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mocks.navigate,
        useOutletContext: mocks.useOutletContext,
    };
});

vi.mock('./ProjectEdit', () => ({
    default: ({ project }) => (
        <div data-testid="mock-project-edit">
            Mock Edit: {project.name}
        </div>
    ),
}));

vi.mock('./ProjectMemberSettings', () => ({
    default: () => <div data-testid="mock-member-settings">Mock Members</div>,
}));

vi.mock('./ProjectDeleteConfirm', () => ({
    default: ({ onDeleted, onCancel }) => (
        <div data-testid="mock-delete-confirm">
            <button onClick={onDeleted}>Simulate Confirm Delete</button>
            <button onClick={onCancel}>Simulate Cancel Delete</button>
        </div>
    ),
}));

describe('ProjectSettings Component', () => {
    const mockProject = {
        _id: '123',
        name: 'Test Project',
        description: 'Test Desc',
        members: []
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    const renderComponent = () => {
        render(
            <MemoryRouter>
                <ProjectSettings />
            </MemoryRouter>
        );
    };

    test('renders loading state when project context is missing', () => {
        mocks.useOutletContext.mockReturnValue(null);
        renderComponent();
        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    test('renders settings sections correctly when project exists', () => {
        mocks.useOutletContext.mockReturnValue({ 
            project: mockProject, 
            setProject: mocks.setProject 
        });

        renderComponent();

        expect(screen.getByText('Settings')).toBeInTheDocument();
        expect(screen.getByText('General')).toBeInTheDocument();
        expect(screen.getByText('Members')).toBeInTheDocument();
        expect(screen.getByText('Danger zone')).toBeInTheDocument();
        
        expect(screen.getByTestId('mock-project-edit')).toHaveTextContent('Mock Edit: Test Project');
        expect(screen.getByTestId('mock-member-settings')).toBeInTheDocument();
    });

    test('opens delete confirmation modal when delete button is clicked', async () => {
        mocks.useOutletContext.mockReturnValue({ 
            project: mockProject, 
            setProject: mocks.setProject 
        });
        const user = userEvent.setup();

        renderComponent();

        expect(screen.queryByTestId('mock-delete-confirm')).not.toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: /delete project/i }));

        expect(screen.getByTestId('mock-delete-confirm')).toBeInTheDocument();
    });

    test('closes modal when cancellation is triggered', async () => {
        mocks.useOutletContext.mockReturnValue({ 
            project: mockProject, 
            setProject: mocks.setProject 
        });
        const user = userEvent.setup();

        renderComponent();

        await user.click(screen.getByRole('button', { name: /delete project/i }));
        expect(screen.getByTestId('mock-delete-confirm')).toBeInTheDocument();

        await user.click(screen.getByText('Simulate Cancel Delete'));

        expect(screen.queryByTestId('mock-delete-confirm')).not.toBeInTheDocument();
    });

    test('navigates to projects list when deletion is confirmed', async () => {
        mocks.useOutletContext.mockReturnValue({ 
            project: mockProject, 
            setProject: mocks.setProject 
        });
        const user = userEvent.setup();

        renderComponent();

        await user.click(screen.getByRole('button', { name: /delete project/i }));
        
        await user.click(screen.getByText('Simulate Confirm Delete'));

        expect(screen.queryByTestId('mock-delete-confirm')).not.toBeInTheDocument();
        expect(mocks.navigate).toHaveBeenCalledWith('/projects');
    });
});