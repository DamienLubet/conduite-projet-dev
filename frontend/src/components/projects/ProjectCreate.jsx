import { projectApi } from '../../api/projectApi';
import { useNavigate } from 'react-router-dom';
import ProjectForm from './ProjectForm';

export default function ProjectCreate({ onCreated, onCancel }) {
    const { createProject } = projectApi();
    const navigate = useNavigate();

    const handleCreate = async (formData) => {
        try {
            const res = await createProject(formData);
            if (onCreated) {
                onCreated();
                navigate(`/projects/${res.projectID}`)
            }
        } catch (err) {
            console.log(err.message);
        }

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