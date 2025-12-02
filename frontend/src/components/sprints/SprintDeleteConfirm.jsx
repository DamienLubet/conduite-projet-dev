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
  /**
   * Handles the deletion of the sprint.
   *
   * @return {Promise<void>}
   */
  const handleDelete = async () => {
    if (!sprint || !sprint._id) return;
    try {
      await deleteSprint(sprint._id);
      if (onDeleted) {
        onDeleted();
      }
    } catch (err) {
      // Simple error handling; could be improved with UI feedback if needed
      // but keeping it minimal like create modal.
      console.error('Failed to delete sprint', err);
    }
  };

  if (!sprint) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>Delete Sprint</h3>
        <p>
          Are you sure you want to delete
          {' '}
          <strong>{sprint.name}</strong>
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
