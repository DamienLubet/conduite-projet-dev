import VersionForm from './UserStoryForm.jsx';

export default function VersionCreate({ projectId, onCreated, onCancel }) {
  const [error, setError] = useState('');
  
  const handleCreate = async (formData) => {
     try {
       await onCreated();
     } catch (error) {
       setError(error.message || 'Failed to create version.');
     }
   }
    
  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>Release Version</h3>
        {error && <p className="error-text">{error}</p>}
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