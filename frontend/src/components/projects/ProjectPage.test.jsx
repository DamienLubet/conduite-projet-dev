import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import Project from './ProjectPage';

const mocks = vi.hoisted(() => ({
    navigate: vi.fn(),
    getProjectById: vi.fn(),
    useParams: vi.fn(),
    useLocation: vi.fn(),
}));


// Mock React Router DOM hooks but keep Link and MemoryRouter functional
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mocks.navigate,
        useParams: mocks.useParams,
        useLocation: mocks.useLocation,
        // We mock Outlet to verify it renders
        Outlet: () => <div data-testid="outlet">Outlet Content</div>,
    };
});

// Mock API
vi.mock('../../api/projectApi', () => ({
    projectApi: () => ({
        getProjectById: mocks.getProjectById,
    }),
}));

describe('Project Component', () => {
    const mockProjectData = {
        _id: '123',
        name: 'Super Project',
        description: 'A great project description',
        owner: { username: 'OwnerUser' },
        members: [
            { userID: { _id: 'u1', username: 'Dev1' }, role: 'Developer' },
            { userID: { _id: 'u2', username: 'Master1' }, role: 'Scrum Master' }
        ]
    };

    beforeEach(() => {
        vi.clearAllMocks();
        
        // Default Router State
        mocks.useParams.mockReturnValue({ projectId: '123' });
        mocks.useLocation.mockReturnValue({ pathname: '/projects/123' });
    });

    const renderComponent = () => {
        render(
            <MemoryRouter>
                <Project />
            </MemoryRouter>
        );
    };

    test('displays loading state initially', () => {
        // Mock a promise that doesn't resolve immediately
        mocks.getProjectById.mockImplementation(() => new Promise(() => {}));
        
        renderComponent();
        
        expect(screen.getByText('Loading project...')).toBeInTheDocument();
    });

    test('fetches and displays project data successfully', async () => {
        mocks.getProjectById.mockResolvedValue({ project: mockProjectData });

        renderComponent();

        expect(mocks.getProjectById).toHaveBeenCalledWith('123');

        await waitFor(() => {
            // Check Header
            expect(screen.getByText('Super Project')).toBeInTheDocument();
            // Check Description
            expect(screen.getByText('A great project description')).toBeInTheDocument();
            // Check Owner
            expect(screen.getByText('OwnerUser')).toBeInTheDocument();
            // Check Members
            expect(screen.getByText(/Dev1/)).toBeInTheDocument();
            expect(screen.getByText(/Master1/)).toBeInTheDocument();
            // Check Outlet
            expect(screen.getByTestId('outlet')).toBeInTheDocument();
        });
    });

    test('redirects to project list on API error', async () => {
        const errorMsg = 'Project not found';
        mocks.getProjectById.mockRejectedValue(new Error(errorMsg));

        renderComponent();

        await waitFor(() => {
            expect(mocks.navigate).toHaveBeenCalledWith(
                '/projects', 
                { state: { error: expect.stringContaining(errorMsg) } }
            );
        });
    });

    test('renders sidebar links correctly', async () => {
        mocks.getProjectById.mockResolvedValue({ project: mockProjectData });
        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('Backlog')).toBeInTheDocument();
            expect(screen.getByText('Sprints')).toBeInTheDocument();
            expect(screen.getByText('Releases')).toBeInTheDocument();
            expect(screen.getByText('Settings')).toBeInTheDocument();
        });
    });

    test('applies "active" class to the current section link', async () => {
        mocks.getProjectById.mockResolvedValue({ project: mockProjectData });
        
        // Simulate being on the "backlog" page
        mocks.useLocation.mockReturnValue({ pathname: '/projects/123/backlog' });

        renderComponent();

        await waitFor(() => {
            const backlogLink = screen.getByText('Backlog');
            const sprintsLink = screen.getByText('Sprints');

            expect(backlogLink).toHaveClass('active');
            expect(sprintsLink).not.toHaveClass('active');
        });
    });

    test('handles missing owner or members gracefully', async () => {
        // Mock data with missing fields
        mocks.getProjectById.mockResolvedValue({ 
            project: { 
                ...mockProjectData, 
                owner: null, 
                members: null 
            } 
        });

        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('No owner found.')).toBeInTheDocument();
            expect(screen.getByText('No members found.')).toBeInTheDocument();
        });
    });
});