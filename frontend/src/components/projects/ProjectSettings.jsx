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

            <section className="section-block">
              <div className="section-header">General</div>
              <ProjectEdit
                  project={project} 
                  setProject={setProject} 
              />
            </section>

            <section className="section-block">
              <div className="section-header">Members</div>
              <ProjectMemberSettings 
                  project={project} 
                  setProject={setProject} 
              />
            </section>
            
            <section className="danger-zone">
              <div className="danger-zone-text">
                <strong>Danger zone</strong>
                <div>Deleting this project will permanently remove all related sprints, user stories and tasks.</div>
              </div>
              <button className="danger-button" onClick={async () => {
                setDeleting(true);
              }}>Delete project</button>
            </section>

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