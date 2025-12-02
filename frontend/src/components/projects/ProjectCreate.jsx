import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectApi } from '../../api/projectApi';
import ProjectForm from './ProjectForm';

/**
 * Component for creating a new project.
 * Renders a form and handles project creation logic.
 * 
 * @param {Object} props
 * @param {Function} props.onCreated - Callback function to be called after successful creation.
 * @param {Function} props.onCancel - Callback function to be called when creation is cancelled.
 * @return {JSX.Element} The rendered ProjectCreate component.
 */
export default function ProjectCreate({ onCreated, onCancel }) {
    const { createProject } = projectApi();
    const navigate = useNavigate();

    const [error, setError] = useState(null);

    /**
     * Handles project creation form submission.
     *
     * @param {Object} formData - The data from the project creation form.
     * @return {Promise<void>}
     */
    const handleCreate = async (formData) => {
        try {
            setError(null);
            const res = await createProject(formData);
            if (onCreated) {
                onCreated();
                navigate(`/projects/${res.projectID}`)
            }
        } catch (err) {
            setError(err.message || 'An error occurred while creating the project.');
        }

    };

    return (
        <div className="modal-backdrop">
            <div className="modal">
                <h3>Create New Project</h3>
                {error && <p className="error-text">{error}</p>}
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