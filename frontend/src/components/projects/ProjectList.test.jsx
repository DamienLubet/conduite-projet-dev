import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import ProjectList from './ProjectList';

const mocks = vi.hoisted(() => ({
    navigate: vi.fn(),
    getProjects: vi.fn(),
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
        getProjects: mocks.getProjects,
    }),
}));

vi.mock('./ProjectCreate', () => ({
    default: ({ onCancel, onCreated }) => (
        <div data-testid="mock-project-create">
            <button onClick={onCancel}>Simulate Cancel</button>
            <button onClick={onCreated}>Simulate Created</button>
        </div>
    ),
}));

describe('ProjectList Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const renderComponent = () => {
        render(
            <MemoryRouter>
                <ProjectList />
            </MemoryRouter>
        );
    };

    test('displays loading state initially', () => {
        mocks.getProjects.mockImplementation(() => new Promise(() => {}));
        renderComponent();
        expect(screen.getByText('Loading projects...')).toBeInTheDocument();
    });

    test('displays error message when API fails', async () => {
        mocks.getProjects.mockRejectedValue(new Error('API Error'));
        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('Failed to load projects.')).toBeInTheDocument();
        });
    });

    test('renders project list successfully', async () => {
        const mockProjects = [
            { _id: '1', name: 'Project A', description: 'Desc A', owner: { username: 'User1' } },
            { _id: '2', name: 'Project B', description: 'Desc B', owner: { username: 'User2' } },
        ];
        mocks.getProjects.mockResolvedValue({ projects: mockProjects });

        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('Project A')).toBeInTheDocument();
            expect(screen.getByText('Project B')).toBeInTheDocument();
            expect(screen.getByText('User1')).toBeInTheDocument();
            expect(screen.getByText('User2')).toBeInTheDocument();
        });
    });

    test('navigates to project details when a card is clicked', async () => {
        const mockProjects = [{ _id: '123', name: 'Project X' }];
        mocks.getProjects.mockResolvedValue({ projects: mockProjects });
        const user = userEvent.setup();

        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('Project X')).toBeInTheDocument();
        });

        await user.click(screen.getByText('Project X'));

        expect(mocks.navigate).toHaveBeenCalledWith('/projects/123');
    });

    test('opens create project modal when button is clicked', async () => {
        mocks.getProjects.mockResolvedValue({ projects: [] });
        const user = userEvent.setup();

        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('My Projects')).toBeInTheDocument();
        });

        await user.click(screen.getByText('Create Project'));

        expect(screen.getByTestId('mock-project-create')).toBeInTheDocument();
    });

    test('closes modal when cancel is clicked in child component', async () => {
        mocks.getProjects.mockResolvedValue({ projects: [] });
        const user = userEvent.setup();

        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('Create Project')).toBeInTheDocument();
        });

        await user.click(screen.getByText('Create Project'));
        expect(screen.getByTestId('mock-project-create')).toBeInTheDocument();

        await user.click(screen.getByText('Simulate Cancel'));

        await waitFor(() => {
            expect(screen.queryByTestId('mock-project-create')).not.toBeInTheDocument();
        });
    });

    test('closes modal when creation is successful', async () => {
        mocks.getProjects.mockResolvedValue({ projects: [] });
        const user = userEvent.setup();

        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('Create Project')).toBeInTheDocument();
        });

        await user.click(screen.getByText('Create Project'));
        expect(screen.getByTestId('mock-project-create')).toBeInTheDocument();

        await user.click(screen.getByText('Simulate Created'));

        await waitFor(() => {
            expect(screen.queryByTestId('mock-project-create')).not.toBeInTheDocument();
        });
    });
});