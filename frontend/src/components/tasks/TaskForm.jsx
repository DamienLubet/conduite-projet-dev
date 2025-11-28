// src/components/tasks/TaskForm.jsx
import { useState } from 'react';

const STATUS_OPTIONS = ['To Do', 'In Progress', 'Done'];

export default function TaskForm({ 
    initialValues = {}, 
    onSubmit, 
    onCancel, 
    onDelete,         
    projectMembers = [], 
    submitLabel = 'Save',
    isEditMode = false
}) {
    const [title, setTitle] = useState(initialValues.title || '');
    const [description, setDescription] = useState(initialValues.description || '');
    const [status, setStatus] = useState(initialValues.status || 'To Do');
    const [assignedTo, setAssignedTo] = useState(initialValues.assignee._id || '');
    const [initialAssignedTo] = useState(initialValues.assignee._id || '');
    
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
            if (isEditMode && assignedTo === initialAssignedTo) {
                // No change in assignee so we don't have to call assignTask
                setAssignedTo('');
            }
            const payload = {
                title: title.trim(),
                description: description.trim(),
                ...(isEditMode && { status, assignedTo: assignedTo})
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
                <label htmlFor="task-title">Title *</label>
                <input
                    id="task-title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={loading}
                    required
                />
            </div>

            <div className="form-group">
                <label htmlFor="task-description">Description</label>
                <textarea
                    id="task-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={loading}
                />
            </div>

            {isEditMode && (
                <>
                    <div className="form-group">
                        <label>Status</label>
                        <select 
                            value={status} 
                            onChange={(e) => setStatus(e.target.value)}
                            disabled={loading}
                        >
                            {STATUS_OPTIONS.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Assigned To</label>
                        <select
                            value={assignedTo}
                            onChange={(e) => setAssignedTo(e.target.value)}
                            disabled={loading}
                        >
                            {initialAssignedTo == '' && <option value="">Unassigned</option>}
                            {projectMembers.map((member) => (
                                <option key={member.userID._id} value={member.userID._id}>
                                    {member.userID.username}
                                </option>
                            ))}
                        </select>
                    </div>
                </>
            )}

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