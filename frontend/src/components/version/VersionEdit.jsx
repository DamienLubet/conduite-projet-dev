import { versionApi } from '../../api/versionApi';
import VersionForm from './VersionForm';

export default function VersionEdit({ version, onUpdated, onCancel }) {
  const { updateVersion } = versionApi();
  const handleUpdate = async (formData) => {
    await updateVersion(version._id, formData);
    await onUpdated();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>Edit Release</h3>
        </div>
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