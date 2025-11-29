import { useState } from 'react';
import '../../styles/projectStyle.css';
import ProjectDeleteConfirm from './ProjectDeleteConfirm.jsx';
import ProjectEdit from './ProjectEdit.jsx';

export default function ProjectList({ projects, userStoryNumber, onUpdated }) {
    // Modal states : Edit, Delete
    const [modalState, setModalState] = useState({ type: null, data: null });
    const closeModal = () => setModalState({ type: null, data: null });
    
    return (
        <div className="projects-list">
            <div className="projects-card-column">
                {Array.isArray(projects) && projects.map((project) => (
                    <div key={project._id} className="project-card" onClick={() => setModalState({ type: 'EDIT', data: project })}>
                        <div className="project-card-header">
                            <div className="project-card-header-left">
                                <span className="project-number">T{userStoryNumber}.{project.number}</span>
                                <span className="project-title">{project.title}</span>
                            </div>
                            <span className="project-status">{project.status}</span>
                            {project.assignee && <span className="project-assignee">{project.assignee.username}</span>}
                        </div>
                        {project.description && <p className="project-description">{project.description}</p>}
                    </div>
                ))}
            </div>
        
            {modalState.type === 'EDIT' && (
                <ProjectEdit 
                    project={modalState.data}
                    onUpdated={async () => {
                        closeModal();
                        await onUpdated();
                    }}
                    onCancel={() => closeModal()}
                    onRequestDelete={() => {
                        setModalState({ type: 'DELETE', data: modalState.data });
                    }}
                />
            )}
            {modalState.type === 'DELETE' && (
                <ProjectDeleteConfirm
                    project={modalState.data}
                    onDeleted={async () => {
                        closeModal();
                        await onUpdated();
                    }}
                    onCancel={() => closeModal()}
                />
            )}
        </div>
                
    );
}