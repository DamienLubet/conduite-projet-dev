import { taskApi } from '../../api/taskApi';
import TaskForm from './TaskForm';

/**
 * Component to create a new task within a user story.
 * @param {Object} props
 * @param {string} props.userStoryId - The ID of the user story to which the task will be added.
 * @param {Function} props.onCreated - Callback function to invoke after task creation.
 * @param {Function} props.onCancel - Callback function to invoke on cancel action.
 * @return {JSX.Element} The rendered TaskCreate component.
 */
export default function TaskCreate({ userStoryId, onCreated, onCancel }) {
    const { createTask } = taskApi();

    /**
     * Handles the creation of a new task.
     *
     * @param {Object} formData - The data from the task creation form.
     * @return {Promise<void>}
     */
    const handleCreate = async (formData) => {
        await createTask(userStoryId, formData);
        if (onCreated) onCreated();
    };

    return (
        <div className="modal-backdrop">
            <div className="modal">
                <h3>Create New Task</h3>
                <TaskForm 
                    onSubmit={handleCreate}
                    onCancel={onCancel}
                    submitLabel="Create Task"
                    isEditMode={false}
                />
            </div>
        </div>
    );
}