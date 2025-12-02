import { useState } from 'react';

/**
 * Reusable form component for creating and editing projects.
 * Handles form state, validation, and submission.
 * 
 * @param {Object} props
 * @param {Object} props.initialValues - Initial values for the form fields.
 * @param {Function} props.onSubmit - Function to call on form submission.
 * @param {Function} [props.onCancel] - Optional function to call on cancel action.
 * @param {Function} [props.onDelete] - Optional function to call on delete action.
 * @param {string} [props.submitLabel='Save'] - Label for the submit button.
 * @param {boolean} [props.isEditMode=false] - Flag indicating if the form is in edit mode.
 * @returns {JSX.Element} The rendered ProjectForm component.
 */
export default function ProjectForm({ 
    initialValues = {}, 
    onSubmit, 
    onCancel, 
    onDelete,         
    submitLabel = 'Save',
    isEditMode = false
}) {
    const [name, setName] = useState(initialValues.name || '');
    const [description, setDescription] = useState(initialValues.description || '');
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Handles form submission.
     *
     * @param {React.FormEvent<HTMLFormElement>} e - Form submit event.
     * @return {Promise<void>}
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) {
            setError('Name is required');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            if (initialValues.name === name.trim()) {
                initialValues.name = undefined;
            }
            const payload = {
                name: name.trim(),
                description: description.trim()
            };
            
            await onSubmit(payload);
        } catch (err) {
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            
            <div className="form-group">
                <label htmlFor="project-name">Name</label>
                <input
                    id="project-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={loading}
                    required
                />
            </div>

            {isEditMode && (
                <>
                    <div className="form-group">
                        <label htmlFor="project-description">Description</label>
                        <textarea
                            id="project-description"
                            className="project-description-input"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            disabled={loading}
                        />
                    </div>
                </>
            )}
            

            <div className="modal-actions">
                {onCancel && <button type="button" onClick={onCancel} disabled={loading}>
                    Cancel
                </button>}
                
                <button type="submit" disabled={loading}>
                    {loading ? 'Saving...' : submitLabel}
                </button>

                {onDelete && (
                    <button 
                        type="button" 
                        className="danger-button"
                        onClick={onDelete}
                        disabled={loading}
                    >
                        Delete
                    </button>
                )}
            </div>
        </form>
    );
}