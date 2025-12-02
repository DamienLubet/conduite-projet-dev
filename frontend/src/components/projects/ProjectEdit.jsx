import { useState } from 'react';
import { projectApi } from '../../api/projectApi';
import ProjectForm from './ProjectForm';

export default function ProjectEdit({ project, setProject }) {
    const { updateProject } = projectApi();
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

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