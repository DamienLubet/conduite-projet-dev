import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import ProjectEdit from './ProjectEdit';

const mocks = vi.hoisted(() => ({
    updateProject: vi.fn(),
    setProject: vi.fn(),
}));

vi.mock('../../api/projectApi', () => ({
    projectApi: () => ({
        updateProject: mocks.updateProject,
    }),
}));

vi.mock('./ProjectForm', () => ({
    default: ({ onSubmit, initialValues }) => (
        <div data-testid="mock-project-form">
            <div data-testid="initial-values">{JSON.stringify(initialValues)}</div>
            <button onClick={() => onSubmit({ name: 'Updated Project Name' })}>
                Simulate Save
            </button>
        </div>
    ),
}));

describe('ProjectEdit Component', () => {
    const mockProject = {
        _id: '123',
        name: 'Original Project',
        description: 'Test Description'
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    const renderComponent = () => {
        render(
            <ProjectEdit 
                project={mockProject} 
                setProject={mocks.setProject} 
            />
        );
    };

    test('renders correctly with initial values passed to form', () => {
        renderComponent();
        expect(screen.getByTestId('mock-project-form')).toBeInTheDocument();
        expect(screen.getByTestId('initial-values')).toHaveTextContent('Original Project');
    });

    test('handles successful project update', async () => {
        renderComponent();
        const user = userEvent.setup();

        mocks.updateProject.mockResolvedValueOnce({ success: true });

        await user.click(screen.getByText('Simulate Save'));

        expect(mocks.updateProject).toHaveBeenCalledWith('123', { name: 'Updated Project Name' });

        await waitFor(() => {
            expect(screen.getByText('Saved successfully!')).toBeInTheDocument();
        });

        expect(mocks.setProject).toHaveBeenCalled();
    });

    test('handles update error correctly', async () => {
        renderComponent();
        const user = userEvent.setup();

        mocks.updateProject.mockRejectedValueOnce(new Error('Update failed'));

        await user.click(screen.getByText('Simulate Save'));

        expect(mocks.updateProject).toHaveBeenCalledWith('123', { name: 'Updated Project Name' });

        await waitFor(() => {
            expect(screen.getByText('Update failed')).toBeInTheDocument();
        });

        expect(mocks.setProject).not.toHaveBeenCalled();
    });

    test('handles update error with default message', async () => {
        renderComponent();
        const user = userEvent.setup();

        mocks.updateProject.mockRejectedValueOnce(new Error());

        await user.click(screen.getByText('Simulate Save'));

        await waitFor(() => {
            expect(screen.getByText('Failed to save project.')).toBeInTheDocument();
        });
    });
});