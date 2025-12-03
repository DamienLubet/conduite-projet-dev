import { useState } from 'react';
import { projectApi } from '../../api/projectApi';

/**
 * Component for managing project member settings.
 * Allows inviting members, changing roles, and removing members.
 * 
 * @param {Object} props
 * @param {Object} props.project - The project data including members.
 * @param {Function} props.setProject - Function to update the project state in the parent component.
 * @return {JSX.Element} The rendered ProjectMemberSettings component.
 */
export default function ProjectMemberSettings({ project, setProject }) {
  const { addProjectMember, removeProjectMember, changeProjectMemberRole, getProjectById } = projectApi();

  const [inviteIdentifier, setInviteIdentifier] = useState('');
  const [inviteRole, setInviteRole] = useState('Developer');
  const [memberError, setMemberError] = useState('');

  const projectId = project._id || project.id;
  const members = project.members || [];

  /**
   * Handles inviting a new member to the project.
   *
   * @param {React.FormEvent<HTMLFormElement>} e - Form submit event.
   * @return {Promise<void>}
   */
  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteIdentifier.trim()) return;

    try {
      setMemberError('');
      const payload = inviteIdentifier.includes('@')
        ? { email: inviteIdentifier.trim(), role: inviteRole }
        : { username: inviteIdentifier.trim(), role: inviteRole };

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

  /**
   * Handles changing the role of an existing member.
   *
   * @param {Object} member - The member whose role is to be changed.
   * @param {string} newRole - The new role to assign to the member.
   * @return {Promise<void>}
   */
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

  /**
   * Handles removing a member from the project.
   *
   * @param {Object} member - The member to remove.
   * @return {Promise<void>}
   */
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
    <div className="project-members-settings">
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
        <button type="submit" className="invite-button">Invite</button>
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
    </div>
  );
}