import { useOutletContext } from 'react-router-dom';
import { taskApi } from '../../api/taskApi';
import TaskForm from './TaskForm';

/**
 * Component to edit an existing task.
 * @param {Object} props
 * @param {Object} props.task - The task object to be edited.
 * @param {Function} props.onUpdated - Callback function to invoke after task update.
 * @param {Function} props.onCancel - Callback function to invoke on cancel action.
 * @param {Function} props.onRequestDelete - Callback function to invoke when delete is requested.
 * @return {JSX.Element} The rendered TaskEdit component.
 */
export default function TaskEdit({ task, onUpdated, onCancel, onRequestDelete }) {
    const { project } = useOutletContext() || {};
    const { updateTask, assignTask } = taskApi();

    if (!project) return null; 

    /** Handles the update of the task.
     *
     * @param {Object} formData - The data from the task edit form.
     * @return {Promise<void>}
     */
    const handleUpdate = async (formData) => {
        await updateTask(task._id, formData);
        if (formData.assignedTo !== '') {
            await assignTask(task._id, { assigneeId: formData.assignedTo });
        }
        if (onUpdated) onUpdated();
    };

    return (
        <div className="modal-backdrop">
            <div className="modal">
                <h3>Edit Task</h3>
                <TaskForm 
                    initialValues={task}
                    projectMembers={project.members} 
                    onSubmit={handleUpdate}
                    onCancel={onCancel}
                    onDelete={onRequestDelete}
                    submitLabel="Save"
                    isEditMode={true}
                />
            </div>
        </div>
    );
}