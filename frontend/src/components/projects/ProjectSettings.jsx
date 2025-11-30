import { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import ProjectDeleteConfirm from './ProjectDeleteConfirm';
import ProjectEdit from './ProjectEdit';
import ProjectMemberSettings from './ProjectMemberSettings';

export default function ProjectSettings() {
  const { project, setProject } = useOutletContext() || {};
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();

    console.log('ProjectSettings render with project:', project);

    if (!project) {
        return <div className="project-settings"><p>Loading...</p></div>;
    }

    return (
        <div className="project-settings">
            <h2>Settings</h2>
            
            <ProjectEdit
                project={project} 
                setProject={setProject} 
            />

            <hr className="divider" />

            <ProjectMemberSettings 
                project={project} 
                setProject={setProject} 
            />
            
           <hr className="divider" />
            
            <button className="danger-button" onClick={async () => {
              setDeleting(true);
            }}> Delete Project </button>

            {deleting && (
              <ProjectDeleteConfirm 
                project={project} 
                onDeleted={ () => {
                  setDeleting(false);
                  navigate('/projects');
                }}
                onCancel={() => setDeleting(false)}
              />
            )}
        </div>
    );
}