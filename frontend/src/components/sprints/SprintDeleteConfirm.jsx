import DeleteConfirmModal from '../common/DeleteConfirmModal.jsx';

/**
 * Component to confirm deletion of a sprint.
 * @param {Object} props
 * @param {Object} props.sprint - The sprint to be deleted.
 * @param {Function} props.onDeleted - Callback function to invoke after deletion.
 * @param {Function} props.onCancel - Callback function to invoke on cancel action.
 * @param {Function} props.deleteSprint - Function to delete a sprint by ID (sprintId) => Promise.
 * @return {JSX.Element} The rendered SprintDeleteConfirm component.
 */
export default function SprintDeleteConfirm({ sprint, onDeleted, onCancel, deleteSprint }) {

  const handleDelete = async () => {
    if (!sprint || !sprint._id) return;
    await deleteSprint(sprint._id);
    if (onDeleted) {
      onDeleted();
    }
  };

  if (!sprint) return null;

  return (
    <DeleteConfirmModal
      title="Delete Sprint"
      itemLabel={sprint.name}
      onCancel={onCancel}
      onConfirm={handleDelete}
      errorPrefix="An error occurred while deleting the sprint"
    />
  );
}
