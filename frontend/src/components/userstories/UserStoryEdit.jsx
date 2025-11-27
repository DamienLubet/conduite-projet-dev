import { useEffect, useState } from 'react';

export default function UserStoryEdit({
  story,
  onUpdated,
  onCancel,
  updateUserStory,
  onRequestDelete,
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [storyPoints, setStoryPoints] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (story) {
      setTitle(story.title);
      setDescription(story.description || '');
      setPriority(story.priority);
      setStoryPoints(
        typeof story.storyPoints === 'number' ? String(story.storyPoints) : ''
      );
    }
  }, [story]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    if (!story || !story._id) return;

    setSaving(true);
    setError(null);
    try {
      const payload = {
        title: title.trim(),
      };

      payload.description = description.trim();
      payload.priority = priority;
      if (storyPoints !== '') {
        const sp = Number(storyPoints);
        if (!Number.isNaN(sp)) {
          payload.storyPoints = sp;
        }
      }

      await updateUserStory(story._id, payload);
      if (onUpdated) {
        onUpdated();
      }
    } catch (err) {
      setError('Failed to update user story.');
    } finally {
      setSaving(false);
    }
  };

  if (!story) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>Edit User Story</h3>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="us-edit-title">Title</label>
            <input
              id="us-edit-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="us-edit-description">Description</label>
            <textarea
              id="us-edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="form-group">
            <label htmlFor="us-edit-priority">Priority</label>
            <select
              id="us-edit-priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="us-edit-storypoints">Story Points</label>
            <input
              id="us-edit-storypoints"
              type="number"
              min="0"
              value={storyPoints}
              onChange={(e) => setStoryPoints(e.target.value)}
            />
          </div>

          <div className="modal-actions">
            <button
              type="button"
              onClick={() => {
                if (!saving && onCancel) onCancel();
              }}
            >
              Cancel
            </button>
            <button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
                      </button>
                      
            {onRequestDelete && (
              <button
                type="button"
                className="danger-button"
                onClick={() => {
                  if (!saving) onRequestDelete(story);
                }}
              >
                Delete
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
