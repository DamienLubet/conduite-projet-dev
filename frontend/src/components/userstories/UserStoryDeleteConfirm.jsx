/**
 * Component for confirming the deletion of a user story.
 * @param {Object} props - Component properties.
 * @param {Object} props.story - The user story to be deleted.
 * @param {Function} props.onDeleted - Callback function after successful deletion.
 * @param {Function} props.onCancel - Callback function to cancel deletion.
 * @param {Function} props.deleteUserStory - Function to delete the user story.
 * @returns {JSX.Element|null} The rendered UserStoryDeleteConfirm component or null if no story is provided.
 */
export default function UserStoryDeleteConfirm({ story, onDeleted, onCancel, deleteUserStory }) {
  /**
   * Handle the deletion of the user story.
   */
  const handleDelete = async () => {
    if (!story || !story._id) return;
    try {
      await deleteUserStory(story._id);
      if (onDeleted) {
        onDeleted();
      }
    } catch (err) {
      // Simple error handling; could be improved with UI feedback if needed
      // but keeping it minimal like create modal.
      console.error('Failed to delete user story', err);
    }
  };

  if (!story) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>Delete User Story</h3>
        <p>
          Are you sure you want to delete
          {' '}
          <strong>{story.title}</strong>
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
