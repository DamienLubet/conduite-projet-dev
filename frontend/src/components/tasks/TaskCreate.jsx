import { taskApi } from '../../api/taskApi';
import TaskForm from './TaskForm';

export default function TaskCreate({ userStoryId, onCreated, onCancel }) {
    const { createTask } = taskApi();

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