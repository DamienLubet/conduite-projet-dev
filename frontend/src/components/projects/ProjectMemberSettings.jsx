import { useState } from 'react';
import { projectApi } from '../../api/projectApi';

export default function ProjectMemberSettings({ project, setProject }) {
    console.log('ProjectMemberSettings render with project:', project);
  const { addProjectMember, removeProjectMember, changeProjectMemberRole, getProjectById } = projectApi();

  const [inviteIdentifier, setInviteIdentifier] = useState('');
  const [inviteRole, setInviteRole] = useState('Developer');
  const [memberError, setMemberError] = useState('');

  const projectId = project._id || project.id;
  const members = project.members || [];

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteIdentifier.trim()) return;

    try {
      setMemberError('');
      const payload = inviteIdentifier.includes('@')
        ? { email: inviteIdentifier.trim(), newRole: inviteRole }
        : { username: inviteIdentifier.trim(), newRole: inviteRole };

      const res = await addProjectMember(projectId, payload);
      
      if (res?.success) {
        setInviteIdentifier('');
        if (res.project && res.project.members) {
            setProject(prev => ({ ...prev, members: res.project.members }));
        } else {
            const refreshed = await getProjectById(projectId);
            if (refreshed?.success && Array.isArray(refreshed.project?.members)) {
                setProject(prev => ({ ...prev, members: refreshed.project.members }));
            }
        }
      }
    } catch (err) {
      setMemberError(err.message || 'Failed to add member');
    }
  };

  const handleChangeRole = async (member, newRole) => {
    try {
      setMemberError('');
      const payload = member.userID?.email
        ? { email: member.userID.email, newRole }
        : { username: member.userID?.username, newRole };

      const res = await changeProjectMemberRole(projectId, payload);
      
      if (res?.success) {
        setProject((prev) => ({
          ...prev,
          members: prev.members.map((mm) =>
            (mm.userID?._id || mm.userID) === (member.userID?._id || member.userID)
              ? { ...mm, role: newRole }
              : mm
          ),
        }));
      }
    } catch (err) {
      setMemberError(err.message || 'Failed to change role');
    }
  };

  const handleRemove = async (member) => {
    try {
      setMemberError('');
      const payload = member.userID?.email
        ? { email: member.userID.email }
        : { username: member.userID?.username };

      const res = await removeProjectMember(projectId, payload);

      if (res?.success) {
        setProject((prev) => ({
          ...prev,
          members: prev.members.filter(
            (mm) => (mm.userID?._id || mm.userID) !== (member.userID?._id || member.userID)
          ),
        }));
      }
    } catch (err) {
      setMemberError(err.message || 'Failed to remove member');
    }
  };

  return (
    <section className="project-settings-section">
      <h3>Members</h3>
      <p className="info-text">Invite users by username or email and manage their roles.</p>
      
      <form onSubmit={handleInvite} className="members-form">
        <input
          type="text"
          placeholder="Username or email"
          value={inviteIdentifier}
          onChange={(e) => setInviteIdentifier(e.target.value)}
        />
        <select
          value={inviteRole}
          onChange={(e) => setInviteRole(e.target.value)}
        >
          <option value="Scrum Master">Scrum Master</option>
          <option value="Developer">Developer</option>
          <option value="Viewer">Viewer</option>
        </select>
        <button type="submit" className="primary-button small">Invite</button>
      </form>

      {memberError && <p className="error-text">{memberError}</p>}

      <ul className="members-list">
        {members.map((m) => (
          <li key={m._id || m.userID?._id || m.userID} className="member-row">
            <div className="member-main">
              <span className="member-name">
                {m.userID?.username || m.userID?.email || 'Unknown user'}
              </span>
              {m.userID?.email && (
                <span className="member-email">{m.userID.email}</span>
              )}
            </div>
            
            <div className="member-actions">
              <select
                value={m.role}
                onChange={(e) => handleChangeRole(m, e.target.value)}
              >
                <option value="Scrum Master">Scrum Master</option>
                <option value="Developer">Developer</option>
                <option value="Viewer">Viewer</option>
              </select>
              
              <button
                type="button"
                onClick={() => handleRemove(m)}
                className="member-remove"
              >
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}