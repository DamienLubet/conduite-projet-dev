import SprintForm from './SprintForm.jsx';

/**
 * Component to create a new sprint within a project.
 * @param {Object} props
 * @param {string} props.projectId - The ID of the project to which the sprint will be added.
 * @param {Function} props.createSprint - Function to create a sprint (projectId, formData) => Promise.
 * @param {Function} props.onCreated - Callback function to invoke after sprint creation.
 * @param {Function} props.onCancel - Callback function to invoke on cancel action.
 * @return {JSX.Element} The rendered SprintCreate component.
 */
export default function SprintCreate({ projectId, createSprint, onCreated, onCancel }) {

  /**
   * Handles the creation of a new sprint.
   *
   * @param {Object} formData - The data from the sprint creation form.
   * @return {Promise<void>}
   */
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