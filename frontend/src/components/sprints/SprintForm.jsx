import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { sprintApi } from '../../api/sprintApi';
import '../../styles/sprintStyle.css';
import SprintCard from './SprintCard.jsx';
import SprintCreate from './SprintCreate.jsx';
import SprintDeleteConfirm from './SprintDeleteConfirm.jsx';
import SprintEdit from './SprintEdit.jsx';

export default function SprintList() {
    const { getSprintsByProject, createSprint, updateSprint, deleteSprint } = sprintApi();
    const { projectId } = useParams();
    
    const [sprints, setSprints] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    // Modal states  :  Create, Edit, Delete
    const [modalState, setModalState] = useState({ type: null, data: null });
    const closeModal = () => setModalState({ type: null, data: null });
    
    const fetchSprints = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getSprintsByProject(projectId);
            setSprints(res.data);
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
                    <h3>Your {'('} {sprints.length} Sprints {')'}</h3>
                    <button
                        className="us-add-button"
                        onClick={() => setModalState({ type: 'CREATE' })}
                    >
                        Create Sprint
                    </button>
                </div>
                
                <div className="sprint-card-column">
                    {Array.isArray(sprints) && sprints.map((story) => (
                        <SprintCard 
                            key={story._id}
                            story={story}
                            onEdit={() => setModalState({ type: 'EDIT', data: story })}
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

            {modalState.type === 'EDIT' && (
                <SprintEdit
                    story={modalState.data}
                    updateSprint={updateSprint}
                    onCancel={() => closeModal()}
                    onUpdated={async () => {
                        closeModal();
                        await fetchSprints();
                    }}
                    onRequestDelete={() => {
                        setModalState({ type: 'DELETE', data: modalState.data });
                    }}
                />
            )}

            {modalState.type === 'DELETE' && (
                <SprintDeleteConfirm
                    story={modalState.data}
                    deleteSprint={deleteSprint}
                    onCancel={() => closeModal()}
                    onDeleted={async () => {
                        closeModal();
                        await fetchSprints();
                    }}
                />
            )}
        </div>
    );
}