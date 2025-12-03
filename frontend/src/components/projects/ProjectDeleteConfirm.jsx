import { projectApi } from "../../api/projectApi";
import DeleteConfirmModal from "../common/DeleteConfirmModal.jsx";

/**
 * Component for confirming project deletion.
 * Renders a modal dialog to confirm deletion and handles the deletion logic.
 * 
 * @param {Object} props
 * @param {Object} props.project - The project to be deleted.
 * @param {Function} props.onDeleted - Callback function to be called after successful deletion.
 * @param {Function} props.onCancel - Callback function to be called when deletion is cancelled.
 * @return {JSX.Element} The rendered ProjectDeleteConfirm component.
 */
export default function ProjectDeleteConfirm({ project, onDeleted, onCancel }) {
  const { deleteProject } = projectApi();

  /**
   * Handles the deletion of the project.
   *
   * @return {Promise<void>}
   */
  const handleDelete = async () => {
      await deleteProject(project._id);
      if (onDeleted) {
        onDeleted();
      }
  };

  if (!project) return null;

  return (
    <DeleteConfirmModal
      title="Delete Project"
      itemLabel={project.name}
      onCancel={onCancel}
      onConfirm={handleDelete}
      errorPrefix="An error occurred while deleting the project"
    />
  );
}
