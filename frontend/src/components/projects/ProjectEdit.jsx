import { useState } from 'react';
import { projectApi } from '../../api/projectApi';
import ProjectForm from './ProjectForm';

/**
 * Component for editing an existing project.
 * Renders a form pre-filled with project data and handles update logic.
 * 
 * @param {Object} props
 * @param {Object} props.project - The project data to edit.
 * @param {Function} props.setProject - Function to update the project state in the parent component.
 * @return {JSX.Element} The rendered ProjectEdit component.
 */
export default function ProjectEdit({ project, setProject }) {
    const { updateProject } = projectApi();
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    /**
     * Handles saving the edited project.
     *
     * @param {Object} formData - The data from the project edit form.
     * @return {Promise<void>}
     */
    const handleSave = async (formData) => {
        try {
            const res = await updateProject(project._id, formData);
            if (res?.success) {
                setMessage('Saved successfully!');
                setProject(prev => ({ ...prev, ...formData }));
            }
        } catch (error) {
            setError(error.message || 'Failed to save project.');
        }
    };

    return (
        <div className="project-edit">
            {message && <div className="project-edit-success">{message}</div>}
            {error && <p className="error-text">{error}</p>}
            <ProjectForm 
                initialValues={project}
                onSubmit={handleSave}
                showCancel={false} 
                submitLabel="Save"
                isEditMode={true}
            />
        </div>
    );
}