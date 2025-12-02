import UserStoryForm from './UserStoryForm';

/**
 * Component for editing an existing user story.
 * @param {Object} props - Component properties.
 * @param {Object} props.story - The user story to be edited.
 * @param {Function} props.updateUserStory - Function to update the user story.
 * @param {Function} props.onUpdated - Callback function after successful update.
 * @param {Function} props.onCancel - Callback function to cancel the editing.
 * @param {Function} props.onRequestDelete - Callback function to request deletion of the user story.
 * @returns {JSX.Element} The rendered UserStoryEdit component.
 */
export default function UserStoryEdit({ story, updateUserStory, onUpdated, onCancel, onRequestDelete }) {

  /**
   * Handle the update of the user story.
   * @param {Object} formData - The data from the user story form.
   */
  const handleUpdate = async (formData) => {
    await updateUserStory(story._id, formData);
    onUpdated();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>Edit User Story</h3>
        </div>
        
        <UserStoryForm 
          initialValues={story} 
          onSubmit={handleUpdate}
          onCancel={onCancel}
          submitLabel="Update"
          onRequestDelete={onRequestDelete}
        />
      </div>
    </div>
  );
}