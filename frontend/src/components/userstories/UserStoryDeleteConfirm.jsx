import DeleteConfirmModal from "../common/DeleteConfirmModal.jsx";

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

  const handleDelete = async () => {
    if (!story || !story._id) return;
    await deleteUserStory(story._id);
    if (onDeleted) {
      onDeleted();
    }
  };

  if (!story) return null;

  return (
    <DeleteConfirmModal
      title="Delete User Story"
      itemLabel={story.title}
      onCancel={onCancel}
      onConfirm={handleDelete}
      errorPrefix="Failed to delete user story"
    />
  );
}
