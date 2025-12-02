import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { userStoryApi } from '../../api/userstoryApi';
import '../../styles/userStoryStyle.css';
import UserStoryCard from './UserStoryCard.jsx';
import UserStoryCreate from './UserStoryCreate.jsx';
import UserStoryDeleteConfirm from './UserStoryDeleteConfirm.jsx';
import UserStoryEdit from './UserStoryEdit.jsx';

/**
 * Component for displaying and managing a list of user stories within a project.
 * @returns {JSX.Element} The rendered UserStoryList component.
 */
export default function UserStoryList() {
    const { getUserStoriesByProject, createUserStory, updateUserStory, deleteUserStory } = userStoryApi();
    const { projectId } = useParams();
    
    const [userStories, setUserStories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    // Modal states  :  Create, Edit, Delete
    const [modalState, setModalState] = useState({ type: null, data: null });
    const closeModal = () => setModalState({ type: null, data: null });
    
    /**
     * Fetch user stories for the current project.
     */
    const fetchUserStories = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getUserStoriesByProject(projectId);
            setUserStories(res.data);
        } catch (err) {
            setError('Failed to load user stories.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserStories();
    }, [projectId]);

    return (
        <div className="userstory-page">
            {loading && <p>Loading...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            
            <div className="userstory-list-container">
                <div className="userstory-header">
                    <h3>Backlog  {'('} {userStories.length} User Stories {')'}</h3>
                    <button
                        className="us-add-button"
                        onClick={() => setModalState({ type: 'CREATE' })}
                    >
                        Create User Story
                    </button>
                </div>
                
                <div className="userstory-card-column">
                    {Array.isArray(userStories) && userStories.map((story) => (
                        <UserStoryCard 
                            key={story._id}
                            story={story}
                            onEdit={() => setModalState({ type: 'EDIT', data: story })}
                        />
                    ))}
                </div>
            </div>

            {/* --- MODALS SECTION --- */}

            {modalState.type === 'CREATE' && (
                <UserStoryCreate
                    projectId={projectId}
                    createUserStory={createUserStory}
                    onCancel={() => closeModal()}
                    onCreated={async () => {
                        closeModal();
                        await fetchUserStories();
                    }}
                />
            )}

            {modalState.type === 'EDIT' && (
                <UserStoryEdit
                    story={modalState.data}
                    updateUserStory={updateUserStory}
                    onCancel={() => closeModal()}
                    onUpdated={async () => {
                        closeModal();
                        await fetchUserStories();
                    }}
                    onRequestDelete={() => {
                        setModalState({ type: 'DELETE', data: modalState.data });
                    }}
                />
            )}

            {modalState.type === 'DELETE' && (
                <UserStoryDeleteConfirm
                    story={modalState.data}
                    deleteUserStory={deleteUserStory}
                    onCancel={() => closeModal()}
                    onDeleted={async () => {
                        closeModal();
                        await fetchUserStories();
                    }}
                />
            )}
        </div>
    );
}