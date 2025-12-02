import { useState } from 'react';
import '../../styles/taskStyle.css';
import TaskDeleteConfirm from './TaskDeleteConfirm.jsx';
import TaskEdit from './TaskEdit.jsx';

/**
 * Component to display a list of tasks within a user story.
 * @param {Object} props
 * @param {Array} props.tasks - The list of tasks to display.
 * @param {string} props.userStoryNumber - The number of the user story for task numbering.
 * @param {Function} props.onUpdated - Callback function to invoke after task updates.
 * @return {JSX.Element} The rendered TaskList component.
 */
export default function TaskList({ tasks, userStoryNumber, onUpdated }) {
    // Modal states : Edit, Delete
    const [modalState, setModalState] = useState({ type: null, data: null });
    const closeModal = () => setModalState({ type: null, data: null });
    
    return (
        <div className="task-list">
            <div className="task-card-column">
                {Array.isArray(tasks) && tasks.map((task) => (
                    <div key={task._id} className="task-card" onClick={() => setModalState({ type: 'EDIT', data: task })}>
                        <div className="task-card-header">
                            <div className="task-card-header-left">
                                <span className="task-number">T{userStoryNumber}.{task.number}</span>
                                <span className="task-title">{task.title}</span>
                            </div>
                            <span className="task-status">{task.status}</span>
                            {task.assignee && <span className="task-assignee">{task.assignee.username}</span>}
                        </div>
                        {task.description && <p className="task-description">{task.description}</p>}
                    </div>
                ))}
            </div>
        
            {modalState.type === 'EDIT' && (
                <TaskEdit 
                    task={modalState.data}
                    onUpdated={async () => {
                        closeModal();
                        await onUpdated();
                    }}
                    onCancel={() => closeModal()}
                    onRequestDelete={() => {
                        setModalState({ type: 'DELETE', data: modalState.data });
                    }}
                />
            )}
            {modalState.type === 'DELETE' && (
                <TaskDeleteConfirm
                    task={modalState.data}
                    onDeleted={async () => {
                        closeModal();
                        await onUpdated();
                    }}
                    onCancel={() => closeModal()}
                />
            )}
        </div>
                
    );
}