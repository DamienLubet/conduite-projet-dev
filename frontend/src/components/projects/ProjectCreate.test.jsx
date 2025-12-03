import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import ProjectCreate from './ProjectCreate';

const mocks = vi.hoisted(() => ({
    navigate: vi.fn(),
    createProject: vi.fn(),
    onCreated: vi.fn(),
    onCancel: vi.fn(),
}));

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mocks.navigate,
    };
});

vi.mock('../../api/projectApi', () => ({
    projectApi: () => ({
        createProject: mocks.createProject,
    }),
}));

vi.mock('./ProjectForm', () => ({
    default: ({ onSubmit, onCancel }) => (
        <div data-testid="mock-project-form">
            <button onClick={() => onSubmit({ name: 'Test Project' })}>
                Simulate Submit
            </button>
            <button onClick={onCancel}>
                Simulate Cancel
            </button>
        </div>
    ),
}));

describe('ProjectCreate Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const renderComponent = () => {
        render(
            <MemoryRouter>
                <ProjectCreate 
                    onCreated={mocks.onCreated} 
                    onCancel={mocks.onCancel} 
                />
            </MemoryRouter>
        );
    };

    test('renders the create project modal correctly', () => {
        renderComponent();
        expect(screen.getByText('Create New Project')).toBeInTheDocument();
        expect(screen.getByTestId('mock-project-form')).toBeInTheDocument();
    });

    test('handles successful project creation', async () => {
        renderComponent();
        const user = userEvent.setup();

        mocks.createProject.mockResolvedValueOnce({ projectID: 123 });

        await user.click(screen.getByText('Simulate Submit'));

        expect(mocks.createProject).toHaveBeenCalledWith({ name: 'Test Project' });
        
        await waitFor(() => {
            expect(mocks.onCreated).toHaveBeenCalled();
            expect(mocks.navigate).toHaveBeenCalledWith('/projects/123');
        });
    });

    test('handles project creation error', async () => {
        renderComponent();
        const user = userEvent.setup();

        mocks.createProject.mockRejectedValueOnce(new Error('Creation failed'));

        await user.click(screen.getByText('Simulate Submit'));

        expect(mocks.createProject).toHaveBeenCalled();
        
        await waitFor(() => {
            expect(screen.getByText('Creation failed')).toBeInTheDocument();
        });

        expect(mocks.onCreated).not.toHaveBeenCalled();
        expect(mocks.navigate).not.toHaveBeenCalled();
    });

    test('handles cancel action', async () => {
        renderComponent();
        const user = userEvent.setup();

        await user.click(screen.getByText('Simulate Cancel'));

        expect(mocks.onCancel).toHaveBeenCalled();
    });
});