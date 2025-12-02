import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectApi } from '../../api/projectApi';
import '../../styles/projectStyle.css';
import ProjectCreate from './ProjectCreate.jsx';

/**
 * Component to display a list of projects.
 * Handles fetching projects, displaying them, and managing modals for project creation.
 * @return {JSX.Element} The rendered ProjectList component.
 */
export default function ProjectList() {
    const { getProjects } = projectApi();
    const navigate = useNavigate();

    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Modal states  :  Create
    const [modalState, setModalState] = useState({ type: null, data: null });
    const closeModal = () => setModalState({ type: null, data: null });

    /**
     * Fetches the list of projects from the API.
     *
     * @return {Promise<void>}
     */
    const fetchProjects = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getProjects();
            setProjects(res.projects);
        } catch (err) {
            setError('Failed to load projects.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    if (loading) return <div>Loading projects...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="project-page">
            <div className="project-list-container">
                <div className="project-header">
                    <h3>My Projects </h3>
                    <button
                        className="project-add-button"
                        onClick={() => setModalState({ type: 'CREATE' })}
                    >
                        Create Project
                    </button>
                </div>
                <hr className="project-header-divider" />
                
                <div className="project-card-column">
                    {Array.isArray(projects) && projects.map((project) => (

                        <div
                            key={project.id || project._id}
                            className="project-card"
                            onClick={() => navigate(`/projects/${project.id || project._id}`)}
                        >
                            <div className="project-card-header">
                                <h4 className="project-title">{project.name}</h4>
                                <span className="project-owner">
                                    {project.owner?.username}
                                </span>
                            </div>
                            <p>{project.description}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* --- MODALS SECTION --- */}

            {modalState.type === 'CREATE' && (
                <ProjectCreate
                    onCancel={() => closeModal()}
                    onCreated={async () => {
                        closeModal();
                    }}
                />
            )}
        </div>
    );
}