import { useState } from 'react';
import { versionApi } from '../../api/versionApi';
import VersionForm from './VersionForm';

/**
 * Component to edit an existing version.
 * @param {Object} props - Component properties.
 * @param {Object} props.version - The version data to edit.
 * @param {Function} props.onUpdated - Callback function after successful update.
 * @param {Function} props.onCancel - Callback function to cancel the edit.
 */
export default function VersionEdit({ version, onUpdated, onCancel }) {
  const { updateVersion } = versionApi();
  const [error, setError] = useState('');

  /**
   * Handle the update of the version.
   * @param {Object} formData - The data from the version form.
   */
  const handleUpdate = async (formData) => {
    try {
      await updateVersion(version._id, formData);
      await onUpdated();
    } catch (error) {
      setError(error.message || 'Failed to update version.');
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>Edit Release</h3>
        </div>
        {error && <p className="error-text">{error}</p>}
        <VersionForm 
          initialValues={version} 
          onSubmit={handleUpdate}
          onCancel={onCancel}
        submitLabel="Update"
        onEdit={true}
        />
      </div>
    </div>
  );
}