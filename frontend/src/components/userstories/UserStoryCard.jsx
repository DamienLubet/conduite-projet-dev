import { useEffect, useState } from 'react';
import { taskApi } from '../../api/taskApi';
import TaskCreate from '../tasks/TaskCreate.jsx';
import TaskList from '../tasks/TaskList.jsx';

export default function UserStoryCard({ 
    story, 
    onEdit
}) {
    const { getTasksByUserStory } = taskApi();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [expandedStory, setExpandedStory] = useState(false);

    const fetchTasks = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getTasksByUserStory(story._id);
            setTasks(res.data);
        } catch (err) {
            setError('Failed to load tasks.' + err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (expandedStory) {
            fetchTasks();
        }
    }, [expandedStory]);

    const toggleTasks = (e) => {
        e.stopPropagation();
        setExpandedStory(prev => !prev);
    };

    return (
        <div>
            <div className="userstory-card" onClick={() => onEdit(story)}>
                <div className="userstory-card-header">
                    <button 
                        onClick={(e) => toggleTasks(e)}
                        className="expand-tasks-button"
                        style={{transform: expandedStory ? 'rotate(90deg)' : 'rotate(0deg)'}}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                    </button>
    
                    <div className="userstory-card-header-left">
                        <span className="userstory-number">US{story.number}</span>
                        <span className="userstory-title">{story.title}</span>
                    </div>
                    
                    <span className={`userstory-priority userstory-priority-${story.priority.toLowerCase()}`}>{story.priority}</span>
                    <span className="userstory-storypoints">{story.storyPoints} SP</span>
                </div>
                
                {story.description && (<p className="userstory-description">{story.description}</p>)}
                
                <div className="userstory-card-footer">
                    <button className='create-task-button' onClick={(e) => {
                        e.stopPropagation();
                        setShowTaskModal(true);
                    }}>New Task</button>
                </div>
            </div>
            
            {expandedStory && (
                <TaskList 
                    tasks={tasks}
                    userStoryNumber={story.number}
                    onUpdated={async () => await fetchTasks()}
                />
            )}

            {/* --- MODALS SECTION --- */}

            {showTaskModal && (
                <TaskCreate
                    userStoryId={story._id.toString()}
                    onCancel={() => setShowTaskModal(false)}
                    onCreated={async () => {
                        setShowTaskModal(false);
                        await fetchTasks(); 
                    }}
                />
            )}
        </div>
    );
}