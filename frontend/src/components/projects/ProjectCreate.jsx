import { projectApi } from '../../api/projectApi';
import ProjectForm from './ProjectForm';

export default function ProjectCreate({ onCreated, onCancel }) {
    const { createProject } = projectApi();

    const handleCreate = async (formData) => {
        await createProject(formData);
        if (onCreated) onCreated();
    };

    return (
        <div className="modal-backdrop">
            <div className="modal">
                <h3>Create New Project</h3>
                <ProjectForm 
                    onSubmit={handleCreate}
                    onCancel={onCancel}
                    submitLabel="Create Project"
                    isEditMode={false}
                />
            </div>
        </div>
    );
}