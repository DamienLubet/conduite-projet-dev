import { useState } from 'react';
import { sprintApi } from '../../api/sprintApi.js';
import UsersStoryCard from '../userstories/UserStoryCard.jsx';
import VersionCreate from '../version/VersionCreate.jsx';
import SprintAssignUS from './SprintAssignUS.jsx';
import SprintDeleteConfirm from './SprintDeleteConfirm.jsx';
import SprintEdit from './SprintEdit.jsx';

/**
 * Component to display a sprint card with details and actions.
 * @param {Object} props
 * @param {Object} props.sprint - The sprint data to display.
 * @param {Function} props.onUpdated - Callback function to invoke after updates.
 * @return {JSX.Element} The rendered SprintCard component.
 */
export default function SprintCard({ sprint, onUpdated }) {
    const { updateSprint, deleteSprint, startSprint } = sprintApi();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [expandedSprint, setExpandedSprint] = useState(false);

    const [modalState, setModalState] = useState({ type: null, data: null });
    const [addUSModal, setAddUSModal] = useState(false);
    const closeModal = () => setModalState({ type: null, data: null });

    const isActive = sprint.status === 'active';
    const isCompleted = sprint.status === 'completed';
    
    /** Toggles the expansion of the sprint to show/hide user stories.
     *
     * @param {Object} e - The event object.
     */
    const toggleUserStory = (e) => {
        e.stopPropagation();
        setExpandedSprint(prev => !prev);
    };

    /** Handles the activation of the sprint. */
    const handleActivate = async () => {
        setLoading(true);
        setError(null);
        try {
            await startSprint(sprint._id);
            await onUpdated();
        } catch (error) {
            setError(error.message || 'Failed to activate sprint.');
        } finally {
            setLoading(false);
        }
    };

    /** Formats a date string to DD-MM-YYYY format.
     *
     * @param {string} dateStr - The date string to format.
     * @return {string} The formatted date string.
     */
    function getDateString(dateStr) {
        const date = new Date(dateStr);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    }
    return (
        <div>
            <div className="sprint-card" onClick={sprint.status === 'completed'
                                                    ? undefined
                                                    : () => setModalState({ type: 'EDIT', data: sprint })}>
                <div className="sprint-card-header">

                    <div className="sprint-card-header-left">
                        <button
                            onClick={(e) => toggleUserStory(e)}
                            className="expand-tasks-button"
                            style={{ transform: expandedSprint ? 'rotate(90deg)' : 'rotate(0deg)' }}
                        >
                           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>
                        </button>
                        <span className="sprint-name">Sprint {sprint.number}: {sprint.name}</span>
                    </div>

                    <div className="sprint-card-header-right">
                        <span className={`sprint-date`}>Start: {getDateString(sprint.startDate)}</span>
                        <span className="sprint-date">End: {getDateString(sprint.endDate)}</span>
                        <span className={`sprint-status`}>{sprint.status}</span>
                        <button className="sprint-button" disabled={isActive || isCompleted} onClick={(e) => {
                            e.stopPropagation();
                            handleActivate();
                        }}>Start</button>
                        <button className="sprint-button" disabled={ isCompleted || !isActive} onClick={(e) => {
                            e.stopPropagation();
                            setModalState({ type: 'COMPLETE', data: sprint });
                        }}>End</button>
                    </div>
                </div>

                {sprint.description && (<p className="sprint-description">{sprint.description}</p>)}

                <div className="sprint-card-footer">
                    <button className='sprint-button'
                        disabled={isActive || isCompleted }
                        onClick={(e) => {
                            e.stopPropagation();
                            setAddUSModal(true);
                    }}>Assign US</button>
                </div>
            </div>

            
            {expandedSprint && (
                <div className="sprint-us-list">
                    {sprint.userStories.map((us) => (
                    <UsersStoryCard key={us._id} story={us} sprint={true} />
                    ))}
                </div>
            )}

            {/* --- MODALS SECTION --- */}

            {addUSModal && (
                <SprintAssignUS
                    sprint={sprint}
                    onCancel={() => setAddUSModal(false)}
                    onUpdated={async () => {
                        setAddUSModal(false);
                        await onUpdated();
                    }}
                />
            )}

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

            {modalState.type === 'COMPLETE' && (
                <VersionCreate
                    sprintId={modalState.data._id}
                    onCancel={() => closeModal()}
                    onCreated={async () => {
                        closeModal();
                        await onUpdated();
                    }}
                />
            )}
        </div>
    );
}