import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { sprintApi } from '../../api/sprintApi.js';
import '../../styles/sprintStyle.css';
import SprintCard from './SprintCard.jsx';
import SprintCreate from './SprintCreate.jsx';

/**
 * Component to display a list of sprints for a specific project.
 * Handles fetching sprints, displaying them, and managing modals for sprint creation.
 * @return {JSX.Element} The rendered SprintList component.
 */
export default function SprintList() {
    const { getSprintsByProject, createSprint } = sprintApi();
    const { projectId } = useParams();

    const [sprints, setSprints] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Modal states  :  Create, Edit, Delete
    const [modalState, setModalState] = useState({ type: null, data: null });
    const closeModal = () => setModalState({ type: null, data: null });

    /**
     * Fetches the list of sprints for the current project from the API.
     *
     * @return {Promise<void>}
     */
    const fetchSprints = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getSprintsByProject(projectId);
            setSprints(res.sprints);
        } catch (err) {
            setError('Failed to load sprints.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSprints();
    }, [projectId]);

    return (
        <div className="sprint-page">
            {loading && <p>Loading...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}

            <div className="sprint-list-container">
                <div className="sprint-header">
                    <h3>Sprints:</h3>
                    <button
                        className="sprint-add-button"
                        onClick={() => setModalState({ type: 'CREATE' })}
                    >
                        Create Sprint
                    </button>
                </div>

                <div className="sprint-card-column">
                    {Array.isArray(sprints) && sprints.map((sprint) => (
                        <SprintCard
                            key={sprint._id}
                            sprint={sprint}
                            onUpdated={async () => {
                                await fetchSprints();
                            }}
                        />
                    ))}
                </div>
            </div>

            {/* --- MODALS SECTION --- */}

            {modalState.type === 'CREATE' && (
                <SprintCreate
                    projectId={projectId}
                    createSprint={createSprint}
                    onCancel={() => closeModal()}
                    onCreated={async () => {
                        closeModal();
                        await fetchSprints();
                    }}
                />
            )}
        </div>
    );
}