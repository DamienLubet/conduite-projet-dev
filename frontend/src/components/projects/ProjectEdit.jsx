// src/components/projects/ProjectEdit.jsx
import { projectApi } from '../../api/projectApi';
import ProjectForm from './ProjectForm';

export default function ProjectEdit({ project, onUpdated, onCancel, onRequestDelete }) {
    const { updateProject} = projectApi();

    const handleUpdate = async (formData) => {
        await updateProject(project._id, formData);
        if (onUpdated) onUpdated();
    };

    return (
        <div className="modal-backdrop">
            <div className="modal">
                <h3>Edit Project</h3>
                <ProjectForm 
                    initialValues={project} 
                    onSubmit={handleUpdate}
                    onCancel={onCancel}
                    onDelete={onRequestDelete}
                    submitLabel="Save"
                    isEditMode={true}
                />
            </div>
        </div>
    );
}