import UserStoryForm from './UserStoryForm.jsx';

/**
 * Component for creating a new user story.
 * @param {Object} props - Component properties.
 * @param {string} props.projectId - The ID of the project to which the user story belongs.
 * @param {Function} props.createUserStory - Function to create a new user story.
 * @param {Function} props.onCreated - Callback function after successful creation.
 * @param {Function} props.onCancel - Callback function to cancel the creation.
 * @returns {JSX.Element} The rendered UserStoryCreate component.
 */
export default function UserStoryCreate({ projectId, createUserStory, onCreated, onCancel }) {
  /**
   * Handle the creation of a new user story.
   * @param {Object} formData - The data from the user story form.
   */
  const handleCreate = async (formData) => {
    await createUserStory(projectId, formData);
    onCreated(); 
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>Create User Story</h3>
        <UserStoryForm 
          onSubmit={handleCreate}
          onCancel={onCancel}
          submitLabel="Create"
        />
      </div>
    </div>
  );
}