import { useState } from 'react';
import { projectApi } from '../../api/projectApi';
import ProjectForm from './ProjectForm';

export default function ProjectEdit({ project, setProject }) {
    const { updateProject } = projectApi();
    const [message, setMessage] = useState('');

    const handleSave = async (formData) => {
        const res = await updateProject(project._id, formData);
        if (res?.success) {
            setMessage('Saved successfully!');
            setProject(prev => ({ ...prev, ...formData }));
        }
    };

    return (
        <section className="project-edit">
            <h3>General</h3>
            {message && <div className="success">{message}</div>}
            
            <ProjectForm 
                initialValues={project}
                onSubmit={handleSave}
                showCancel={false} 
                submitLabel="Save"
                isEditMode={true}
            />

        </section>
    );
}