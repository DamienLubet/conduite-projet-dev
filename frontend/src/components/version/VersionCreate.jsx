import { useState } from 'react';
import { sprintApi } from '../../api/sprintApi.js';
import VersionForm from './VersionForm.jsx';

/**
 * Component to create a new version for a sprint.
 * @param {Object} props - Component properties.
 * @param {number} props.sprintId - The ID of the sprint to complete.
 * @param {Function} props.onCreated - Callback function after successful creation.
 * @param {Function} props.onCancel - Callback function to cancel the creation.
 */
export default function VersionCreate({ sprintId, onCreated, onCancel }) {
  const [error, setError] = useState('');
  const { completeSprint } = sprintApi();

  /**
   * Handle the creation of a new version.
   * @param {Object} formData - The data from the version form.
   */
  const handleCreate = async (formData) => {
    try {
       await completeSprint(sprintId, formData.type);
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