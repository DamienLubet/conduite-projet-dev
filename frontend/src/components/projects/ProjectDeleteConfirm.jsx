import { projectApi } from "../../api/projectApi";

export default function ProjectDeleteConfirm({ project, onDeleted, onCancel }) {
  const { deleteProject } = projectApi();
  const handleDelete = async () => {
    if (!project || !project._id) return;
    try {
      await deleteProject(project._id);
      if (onDeleted) {
        onDeleted();
      }
    } catch (err) {
      // Simple error handling; could be improved with UI feedback if needed
      // but keeping it minimal like create modal.
      console.error('Failed to delete user story', err);
    }
  };

  if (!project) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>Delete Project</h3>
        <p>
          Are you sure you want to delete
          {' '}
          <strong>{project.name}</strong>
          ?
        </p>
        <div className="modal-actions">
          <button type="button" className="cancel-button" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="danger-button" onClick={handleDelete}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
