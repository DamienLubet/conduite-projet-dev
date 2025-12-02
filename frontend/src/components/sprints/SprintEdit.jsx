import SprintForm from './SprintForm.jsx';

/**
 * Component to edit an existing sprint.
 * @param {Object} props
 * @param {Object} props.sprint - The sprint data to edit.
 * @param {Function} props.updateSprint - Function to update a sprint (sprintId, formData) => Promise.
 * @param {Function} props.onUpdated - Callback function to invoke after sprint update.
 * @param {Function} props.onCancel - Callback function to invoke on cancel action.
 * @param {Function} props.onRequestDelete - Callback function to invoke when delete is requested.
 * @return {JSX.Element} The rendered SprintEdit component.
 */
export default function SprintEdit({ sprint, updateSprint, onUpdated, onCancel, onRequestDelete }) {

  /** Handles the update of the sprint.
   *
   * @param {Object} formData - The data from the sprint edit form.
   * @return {Promise<void>}
   */
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