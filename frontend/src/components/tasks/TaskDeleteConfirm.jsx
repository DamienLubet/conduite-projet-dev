import { taskApi } from "../../api/taskApi";

export default function TaskDeleteConfirm({ task, onDeleted, onCancel }) {
  const { deleteTask } = taskApi();
  const handleDelete = async () => {
    if (!task || !task._id) return;
    try {
      await deleteTask(task._id);
      if (onDeleted) {
        onDeleted();
      }
    } catch (err) {
      // Simple error handling; could be improved with UI feedback if needed
      // but keeping it minimal like create modal.
      console.error('Failed to delete user story', err);
    }
  };

  if (!task) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>Delete Task</h3>
        <p>
          Are you sure you want to delete
          {' '}
          <strong>{task.title}</strong>
          ?
        </p>
        <div className="modal-actions">
          <button type="button" className="cancel-button" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="danger-button" onClick={handleDelete}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
