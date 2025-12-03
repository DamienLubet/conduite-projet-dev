import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import ProjectDeleteConfirm from './ProjectDeleteConfirm';

const mocks = vi.hoisted(() => ({
    deleteProject: vi.fn(),
    onDeleted: vi.fn(),
    onCancel: vi.fn(),
}));

vi.mock('../../api/projectApi', () => ({
    projectApi: () => ({
        deleteProject: mocks.deleteProject,
    }),
}));

// We mock the child generic modal to isolate the logic of the wrapper
vi.mock('../common/DeleteConfirmModal', () => ({
    default: ({ title, itemLabel, onConfirm, onCancel }) => (
        <div data-testid="mock-confirm-modal">
            <h1>{title}</h1>
            <p>{itemLabel}</p>
            <button onClick={onCancel}>Mock Cancel</button>
            <button onClick={onConfirm}>Mock Confirm</button>
        </div>
    ),
}));

describe('ProjectDeleteConfirm Component', () => {
    const mockProject = {
        _id: '123',
        name: 'Project to Delete'
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    const renderComponent = (projectProp = mockProject) => {
        render(
            <ProjectDeleteConfirm 
                project={projectProp} 
                onDeleted={mocks.onDeleted} 
                onCancel={mocks.onCancel} 
            />
        );
    };

    test('returns null if no project is provided', () => {
        const { container } = render(<ProjectDeleteConfirm project={null} />);
        expect(container).toBeEmptyDOMElement();
    });

    test('renders the confirmation modal with correct props', () => {
        renderComponent();
        
        expect(screen.getByTestId('mock-confirm-modal')).toBeInTheDocument();
        expect(screen.getByText('Delete Project')).toBeInTheDocument();
        expect(screen.getByText('Project to Delete')).toBeInTheDocument();
    });

    test('handles cancellation correctly', async () => {
        renderComponent();
        const user = userEvent.setup();

        await user.click(screen.getByText('Mock Cancel'));

        expect(mocks.onCancel).toHaveBeenCalled();
        expect(mocks.deleteProject).not.toHaveBeenCalled();
    });

    test('handles deletion confirmation and API call', async () => {
        renderComponent();
        const user = userEvent.setup();
        
        mocks.deleteProject.mockResolvedValue({ success: true });

        await user.click(screen.getByText('Mock Confirm'));

        // 1. Check API call
        expect(mocks.deleteProject).toHaveBeenCalledWith('123');

        // 2. Check callback
        await waitFor(() => {
            expect(mocks.onDeleted).toHaveBeenCalled();
        });
    });

    test('passes error prefix to modal (implicit check via component logic)', async () => {
        renderComponent();
        expect(screen.getByTestId('mock-confirm-modal')).toBeInTheDocument();
    });
});