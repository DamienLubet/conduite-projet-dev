import { taskApi } from "../../api/taskApi";
import DeleteConfirmModal from "../common/DeleteConfirmModal.jsx";

/**
 * Component to confirm deletion of a task.
 * @param {Object} props
 * @param {Object} props.task - The task to be deleted.
 * @param {Function} props.onDeleted - Callback function to invoke after task deletion.
 * @param {Function} props.onCancel - Callback function to invoke on cancel action.
 * @return {JSX.Element|null} The rendered TaskDeleteConfirm component or null if no task is provided.
 */
export default function TaskDeleteConfirm({ task, onDeleted, onCancel }) {
  const { deleteTask } = taskApi();
  
  /**
   * Handles the deletion of the task.
   *
   * @return {Promise<void>}
   */
  const handleDelete = async () => {
    if (!task || !task._id) return;
    await deleteTask(task._id);
    if (onDeleted) {
      onDeleted();
    }
  };

  if (!task) return null;

  return (
    <DeleteConfirmModal
      title="Delete Task"
      itemLabel={task.title}
      onCancel={onCancel}
      onConfirm={handleDelete}
      errorPrefix="An error occurred while deleting the task"
    />
  );
}
