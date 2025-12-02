import { useState } from 'react';

/**
 * Component for creating or editing a user story.
 * @param {Object} props - Component properties.
 * @param {Object} [props.initialValues={}] - Initial values for the form fields.
 * @param {Function} props.onSubmit - Callback function to handle form submission.
 * @param {Function} props.onCancel - Callback function to handle form cancellation.
 * @param {string} [props.submitLabel='Save'] - Label for the submit button.
 * @param {Function} [props.onRequestDelete] - Optional callback function to handle deletion request.
 * @returns {JSX.Element} The rendered UserStoryForm component.
 */
export default function UserStoryForm({ 
  initialValues = {}, 
  onSubmit, 
  onCancel, 
  submitLabel = 'Save', 
  onRequestDelete
}) {
  const [title, setTitle] = useState(initialValues.title || '');
  const [description, setDescription] = useState(initialValues.description || '');
  const [priority, setPriority] = useState(initialValues.priority || 'Medium');
  const [storyPoints, setStoryPoints] = useState(initialValues.storyPoints || '');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        priority,
        storyPoints: storyPoints !== '' ? Number(storyPoints) : undefined
      };
      
      await onSubmit(payload);
      
    } catch (err) {
      setError(err.message || 'Failed to save user story');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <p className="error-text">{error}</p>}
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
        <button type="button" onClick={onCancel} disabled={loading}>
          Cancel
        </button>
        <button type="submit" disabled={loading}>
          {loading ? 'Saving...' : submitLabel}
              </button>
              
        {onRequestDelete && (
        <button
            type="button"
            className="danger-button"
            onClick={() => {
                if (!loading) onRequestDelete();
            }}>
            Delete
        </button>)}
              
      </div>
    </form>
  );
}