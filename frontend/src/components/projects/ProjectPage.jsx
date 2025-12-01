import { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useParams } from "react-router-dom";
import { projectApi } from "../../api/projectApi";
import "../../styles/projectPageStyle.css";

export default function Project() {
    const { getProjectById } = projectApi();
    const { projectId } = useParams();
    const location = useLocation();

    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchProject = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getProjectById(projectId);
            setProject(res.project);
        } catch (err) {
            setError('error loading project: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProject();
    }, [projectId]);

    const getClass = (path) => {
        return location.pathname.includes(path) ? "active" : "";
    };

    if (loading) {
        return <div className="loading"><p>Loading project...</p></div>;
    }

    if (error) {
        return <div className="error-popup"><p>{error}</p></div>;
    }

    return (
        <div className="project-page">
            <div className="sidebar">
                <h2>{loading ? "..." : (project?.name)}</h2>
                
                <Link to={`/projects/${projectId}/backlog`} className={getClass('backlog')}>
                    Backlog
                </Link>
                
                <Link to={`/projects/${projectId}/sprints`} className={getClass('sprints')}>
                    Sprints
                </Link>
                
                <Link to={`/projects/${projectId}/releases`} className={getClass('releases')}>
                    Releases
                </Link>
                
                <Link to={`/projects/${projectId}/settings`} className={getClass('settings')}>
                    Settings
                </Link>
            </div>

            <div className="main-content">
                <Outlet context={{ project, setProject }}/>
            </div>
            
            <div className="project-sidebar-right">
                <div className="project-description">
                    <h3>Description:</h3>
                    <p>{project?.description || ""}</p>
                </div>

                <div className="project-members">
                    <h3>Product Owner:</h3>
                    <div className="project-members-list">
                        {project?.owner ? (
                            <div className="project-member-owner">
                                {project.owner.username}
                            </div>
                        ) : <p className="error" style={{ color: 'red' }}>No owner found.</p>}
                    </div>
                </div>

                <div className="project-members">
                    <h3>Members:</h3>
                    <div className="project-members-list">
                        {project?.members?.map((member) => (
                            <div key={member.userID._id} className={`project-member-${member.role.toLowerCase()}`}>
                                {member.userID.username} - {member.role}
                            </div>
                        )) || <p className="error" style={{ color: 'red' }}>No members found.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}
                
        