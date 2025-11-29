import { taskApi } from '../../api/taskApi';
import TaskForm from './TaskForm';

export default function TaskEdit({ task, onUpdated, onCancel, onRequestDelete }) {
    //const { project } = useOutletContext() || {};
    const { updateTask, assignTask } = taskApi();

    //if (!project) return null; 

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
                    //projectMembers={project.members} 
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