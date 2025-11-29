import { useState } from 'react';

export default function ProjectForm({ 
    initialValues = {}, 
    onSubmit, 
    onCancel, 
    onDelete,         
    submitLabel = 'Save',
    isEditMode = false
}) {
    const [name, setName] = useState(initialValues.name || '');
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) {
            setError('Name is required');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const payload = {
                name: name.trim()
            };
            
            await onSubmit(payload);
        } catch (err) {
            console.error(err);
            setError('An error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            
            <div className="form-group">
                <label htmlFor="project-name">Name *</label>
                <input
                    id="project-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={loading}
                    required
                />
            </div>

            <div className="modal-actions">
                <button type="button" onClick={onCancel} disabled={loading}>
                    Cancel
                </button>
                
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