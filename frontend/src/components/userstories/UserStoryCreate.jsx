import { useState } from 'react';

export default function UserStoryCreate({
  projectId,
  onCreated,
  onCancel,
  createUserStory,
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [storyPoints, setStoryPoints] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    setCreating(true);
    setError(null);
    try {
      const payload = {
        title: title.trim(),
      };

      if (description.trim()) {
        payload.description = description.trim();
      }
      if (priority) {
        payload.priority = priority;
      }
      if (storyPoints) {
        const sp = Number(storyPoints);
        if (!Number.isNaN(sp)) {
          payload.storyPoints = sp;
        }
      }

      await createUserStory(projectId, payload);
      if (onCreated) {
        onCreated();
      }
      // reset local state after success
      setTitle('');
      setDescription('');
      setPriority('Medium');
      setStoryPoints('');
    } catch (err) {
      setError('Failed to create user story.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>Create User Story</h3>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="us-title">Title</label>
            <input
              id="us-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter user story title"
            />
          </div>

          <div className="form-group">
            <label htmlFor="us-description">Description</label>
            <textarea
              id="us-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
              rows={3}
            />
          </div>

          <div className="form-group">
            <label htmlFor="us-priority">Priority</label>
            <select
              id="us-priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="us-storypoints">Story Points</label>
            <input
              id="us-storypoints"
              type="number"
              min="0"
              value={storyPoints}
              onChange={(e) => setStoryPoints(e.target.value)}
              placeholder="Optional story points"
            />
          </div>

          <div className="modal-actions">
            <button
              type="button"
              onClick={() => {
                if (!creating && onCancel) {
                  onCancel();
                }
              }}
            >
              Cancel
            </button>
            <button type="submit" disabled={creating}>
              {creating ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
