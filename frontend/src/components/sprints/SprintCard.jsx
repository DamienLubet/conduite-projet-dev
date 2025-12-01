import { useEffect, useState } from 'react';
import { sprintApi } from '../../api/sprintApi';

export default function SprintCard({
    sprint,
    onEdit
}) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [expandedSprint, setExpandedSprint] = useState(false);


    const toggleTasks = (e) => {
        e.stopPropagation();
        setExpandedSprint(prev => !prev);
    };

    return (
        <div>
            <div className="sprint-card" onClick={() => onEdit(sprint)}>
                <div className="sprint-card-header">
                    <button
                        onClick={(e) => toggleTasks(e)}
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
                    <span className="sprint-date">End: {sprint.startDate}</span>
                </div>

                {sprint.description && (<p className="sprint-description">{sprint.description}</p>)}
            </div>

            {expandedSprint && sprint.userStories.map((us) => (
                <UsersStoryCard
                    userStories={us}
                />)
            )}
        </div>
    );
}