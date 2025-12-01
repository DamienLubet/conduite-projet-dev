import SprintForm from './SprintForm.jsx';

export default function SprintEdit({ sprint, updateSprint, onUpdated, onCancel, onRequestDelete }) {

  const handleUpdate = async (formData) => {
    await updateSprint(sprint._id, formData);
    onUpdated();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>Edit Sprint</h3>
        </div>

        <SprintForm
          initialValues={sprint}
          onSubmit={handleUpdate}
          onCancel={onCancel}
          submitLabel="Update"
          onDelete={onRequestDelete}
        />
      </div>
    </div>
  );
}