import UserStoryForm from './UserStoryForm.jsx';

export default function UserStoryCreate({ projectId, createUserStory, onCreated, onCancel }) {
  
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