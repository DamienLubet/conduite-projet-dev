// src/components/userstories/UserStoryEdit.jsx
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
            {/* Bouton Delete spécifique à l'édition */}
            {onRequestDelete && (
                <button 
                    className="danger-button-small" 
                    onClick={() => onRequestDelete(story)}
                >
                    Trash Icon / Delete
                </button>
            )}
        </div>
        
        <UserStoryForm 
          initialValues={story} // On passe la story actuelle
          onSubmit={handleUpdate}
          onCancel={onCancel}
          submitLabel="Update"
          onRequestDelete={onRequestDelete}
        />
      </div>
    </div>
  );
}