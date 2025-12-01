import VersionForm from './UserStoryForm.jsx';

export default function VersionCreate({ projectId, onCreated, onCancel }) {
   const handleCreate = async (formData) => {
    await onCreated();
   }
    
  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>Release Version</h3>
        <VersionForm 
          onSubmit={handleCreate}
          onCancel={onCancel}
          submitLabel="Create"
          onCreate={true}        
        />
      </div>
    </div>
  );
}