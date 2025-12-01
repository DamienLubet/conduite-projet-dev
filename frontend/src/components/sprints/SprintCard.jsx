import { useState } from 'react';
import { sprintApi } from '../../api/sprintApi.js';
import UsersStoryCard from '../userstories/UserStoryCard.jsx';
import SprintDeleteConfirm from './SprintDeleteConfirm.jsx';
import SprintEdit from './SprintEdit.jsx';


export default function SprintCard({
    sprint,
    onUpdated
}) {
    const { updateSprint, deleteSprint } = sprintApi();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [expandedSprint, setExpandedSprint] = useState(false);

    const [modalState, setModalState] = useState({ type: null, data: null });
    const closeModal = () => setModalState({ type: null, data: null });
    
    const toggleUserStory = (e) => {
        e.stopPropagation();
        setExpandedSprint(prev => !prev);
    };

    return (
        <div>
            <div className="sprint-card" onClick={() => setModalState({ type: 'EDIT', data: sprint })}>
                <div className="sprint-card-header">
                    <button
                        onClick={(e) => toggleUserStory(e)}
                        className="expand-tasks-button"
                        style={{ transform: expandedSprint ? 'rotate(90deg)' : 'rotate(0deg)' }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                    </button>

                    <div className="sprint-card-header-left">
                        <span className="sprint-name">{sprint.name}</span>
                    </div>

                    <span className={`sprint-date`}>Start: {sprint.startDate}</span>
                    <span className="sprint-date">End: {sprint.endDate}</span>
                </div>

                {sprint.description && (<p className="sprint-description">{sprint.description}</p>)}
            </div>

            {expandedSprint && sprint.userStories.map((us) => (
                <UsersStoryCard
                    userStories={us}
                />)
            )}

            {/* --- MODALS SECTION --- */}

            {modalState.type === 'EDIT' && (
                <SprintEdit
                    sprint={modalState.data}
                    updateSprint={updateSprint}
                    onCancel={() => closeModal()}
                    onUpdated={async () => {
                        closeModal();
                        await onUpdated();
                    }}
                    onRequestDelete={() => {
                        setModalState({ type: 'DELETE', data: modalState.data });
                    }}
                />
            )}

            {modalState.type === 'DELETE' && (
                <SprintDeleteConfirm
                    sprint={modalState.data}
                    deleteSprint={deleteSprint}
                    onCancel={() => closeModal()}
                    onDeleted={async () => {
                        closeModal();
                        await onUpdated();
                    }}
                />
            )}
        </div>
    );
}