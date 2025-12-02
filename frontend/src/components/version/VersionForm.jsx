import { useState } from 'react';

const TYPE = {
    MAJOR: 'major',
    MINOR: 'minor',
    PATCH: 'patch'
};

/**
 * Component for a version form used in creating or editing versions.
 * @param {Object} props - Component properties.
 * @param {Object} [props.initialValues={}] - Initial values for the form fields.
 * @param {Function} props.onSubmit - Callback function to handle form submission.
 * @param {Function} props.onCancel - Callback function to handle form cancellation.
 * @param {boolean} [props.onEdit] - Flag indicating if the form is in edit mode.
 * @param {boolean} [props.onCreate] - Flag indicating if the form is in create mode.
 * @param {string} [props.submitLabel='Save'] - Label for the submit button.
 */
export default function VersionForm({ 
  initialValues = {}, 
  onSubmit, 
  onCancel, 
  onEdit,
  onCreate,
  submitLabel = 'Save'
}) {
    const [type, setType] = useState(TYPE.MINOR);
    const [description, setDescription] = useState(initialValues.description || '');
    const [releaseDate, setReleaseDate] = useState(initialValues.releaseDate ? initialValues.releaseDate.slice(0, 10) : '');
    
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    
    /**
     * Handle form submission.
     * @param {Object} e - The form submission event.
     */
    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      setError(null);
      try {
          const payload = {
            type,
            description: description.trim() || undefined,
            releaseDate: releaseDate || undefined
        };
          await onSubmit(payload);
      } catch (err) {
            setError(err.message || 'Error submitting form.');
      } finally {
          setLoading(false);
      }
    };
    
    return (
        <form onSubmit={handleSubmit}>
            {error && <p className="error-text">{error}</p>}
            {onCreate &&
                (<div className="form-group">
                    <label htmlFor="version-type-tag">Type</label>
                <select id="version-type-tag" value={type}
                    onChange={(e) => setType(e.target.value)}>
                        <option value={TYPE.MAJOR}>Major</option>
                        <option value={TYPE.MINOR}>Minor</option>
                        <option value={TYPE.PATCH}>Patch</option>
                    </select>
                </div>
            )}

            {onEdit &&
                (<div>
                <div className="form-group">
                    <label htmlFor="version-edit-description">Description</label>
                    <textarea
                        id="version-edit-description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>

            
                <div className="form-group">
                    <label htmlFor="version-edit-release-date">Release Date</label>
                    <input
                        id="version-edit-release-date"
                        type="date"
                        value={releaseDate}
                        onChange={(e) => setReleaseDate(e.target.value)}
                    />
                </div>
                </div>
            )}
            
            <div className="modal-actions">
                <button type="button" onClick={onCancel} disabled={loading}>
                    Cancel
                </button>
                <button type="submit" disabled={loading}>
                    {loading ? 'Saving...' : submitLabel}
                </button>
            </div>
        </form>
    );
}
