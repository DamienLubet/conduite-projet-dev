import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { projectApi } from '../../api/projectApi';
import '../../styles/projectStyle.css';
//import ProjectCard from './ProjectCard.jsx';
import ProjectCreate from './ProjectCreate.jsx';
import ProjectDeleteConfirm from './ProjectDeleteConfirm.jsx';
import ProjectEdit from './ProjectEdit.jsx';

export default function ProjectList() {
    const { getProjects, createProject, updateProject, deleteProject } = projectApi();
    const { projectId } = useParams();
    
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    // Modal states  :  Create, Edit, Delete
    const [modalState, setModalState] = useState({ type: null, data: null });
    const closeModal = () => setModalState({ type: null, data: null });
    
    const fetchProjects = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getProjects();
            setProjects(res.data);
        } catch (err) {
            setError('Failed to load projects.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, [projectId]);

    return (
        <div className="project-page">
            {loading && <p>Loading...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            
            <div className="project-list-container">
                <div className="project-header">
                    <h3>Your  {projects.length} Projects </h3>
                    <button
                        className="project-add-button"
                        onClick={() => setModalState({ type: 'CREATE' })}
                    >
                        Create Project
                    </button>
                </div>
                
                <div className="project-card-column">
                    {Array.isArray(projects) && projects.map((project) => (
                        <ProjectCard 
                            key={project._id}
                            project={project}
                            onEdit={() => setModalState({ type: 'EDIT', data: project })}
                        />
                    ))}
                </div>
            </div>

            {/* --- MODALS SECTION --- */}

            {modalState.type === 'CREATE' && (
                <ProjectCreate
                    projectId={projectId}
                    createProject={createProject}
                    onCancel={() => closeModal()}
                    onCreated={async () => {
                        closeModal();
                        await fetchProjects();
                    }}
                />
            )}

            {modalState.type === 'EDIT' && (
                <ProjectEdit
                    project={modalState.data}
                    updateProject={updateProject}
                    onCancel={() => closeModal()}
                    onUpdated={async () => {
                        closeModal();
                        await fetchProjects();
                    }}
                    onRequestDelete={() => {
                        setModalState({ type: 'DELETE', data: modalState.data });
                    }}
                />
            )}

            {modalState.type === 'DELETE' && (
                <ProjectDeleteConfirm
                    project={modalState.data}
                    deleteProject={deleteProject}
                    onCancel={() => closeModal()}
                    onDeleted={async () => {
                        closeModal();
                        await fetchProjects();
                    }}
                />
            )}
        </div>
    );
}