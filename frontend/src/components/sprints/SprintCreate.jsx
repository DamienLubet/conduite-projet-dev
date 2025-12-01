import SprintForm from './SprintForm.jsx';

export default function SprintCreate({ projectId, createSprint, onCreated, onCancel }) {

  const handleCreate = async (formData) => {
    await createSprint(projectId, formData);
    onCreated();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>Create Sprint</h3>
        <SprintForm
          onSubmit={handleCreate}
          onCancel={onCancel}
          submitLabel="Create"
        />
      </div>
    </div>
  );
}