import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { userStoryApi } from '../../api/userstoryApi';
import '../../styles/userStoryStyle.css';
import UserStoryCard from './UserStoryCard.jsx';
import UserStoryCreate from './UserStoryCreate.jsx';
import UserStoryDeleteConfirm from './UserStoryDeleteConfirm.jsx';
import UserStoryEdit from './UserStoryEdit.jsx';

export default function UserStoryList() {
    const { getUserStoriesByProject, createUserStory, updateUserStory, deleteUserStory } = userStoryApi();
    const { projectId } = useParams();
    
    const [userStories, setUserStories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingStory, setEditingStory] = useState(null);
    const [deletingStory, setDeletingStory] = useState(null);
    
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
                        onClick={() => setShowCreateModal(true)}
                    >
                        Create User Story
                    </button>
                </div>
                
                <div className="userstory-card-column">
                    {Array.isArray(userStories) && userStories.map((story) => (
                        <UserStoryCard 
                            key={story._id}
                            story={story}
                            onEdit={setEditingStory}
                        />
                    ))}
                </div>
            </div>

            {/* --- MODALS SECTION --- */}

            {showCreateModal && (
                <UserStoryCreate
                    projectId={projectId}
                    createUserStory={createUserStory}
                    onCancel={() => setShowCreateModal(false)}
                    onCreated={async () => {
                        setShowCreateModal(false);
                        await fetchUserStories();
                    }}
                />
            )}

            {editingStory && (
                <UserStoryEdit
                    story={editingStory}
                    updateUserStory={updateUserStory}
                    onCancel={() => setEditingStory(null)}
                    onRequestDelete={(story) => {
                        setEditingStory(null);
                        setDeletingStory(story);
                    }}
                    onUpdated={async () => {
                        setEditingStory(null);
                        await fetchUserStories();
                    }}
                />
            )}

            {deletingStory && (
                <UserStoryDeleteConfirm
                    story={deletingStory}
                    deleteUserStory={deleteUserStory}
                    onCancel={() => setDeletingStory(null)}
                    onDeleted={async () => {
                        setDeletingStory(null);
                        await fetchUserStories();
                    }}
                />
            )}
        </div>
    );
}