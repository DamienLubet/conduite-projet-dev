import UserStoryForm from './UserStoryForm';

export default function UserStoryEdit({ story, updateUserStory, onUpdated, onCancel, onRequestDelete }) {

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