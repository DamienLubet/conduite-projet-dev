export default function SprintDeleteConfirm({
  sprint,
  onDeleted,
  onCancel,
  deleteSprint,
}) {
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
