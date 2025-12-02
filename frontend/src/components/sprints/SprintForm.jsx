import { useState } from 'react';

/**
 * Component for the sprint form used in creating and editing sprints.
 * @param {Object} props
 * @param {Object} [props.initialValues={}] - Initial values for the form fields.
 * @param {Function} props.onSubmit - Function to handle form submission.
 * @param {Function} props.onCancel - Function to handle form cancellation.
 * @param {Function} [props.onDelete] - Optional function to handle sprint deletion.
 * @param {string} [props.submitLabel='Save'] - Label for the submit button.
 * @return {JSX.Element} The rendered SprintForm component.
 */
export default function SprintForm({
    initialValues = {},
    onSubmit,
    onCancel,
    onDelete,
    submitLabel = 'Save'
}) {
    const [name, setName] = useState(initialValues.name || '');
    const [description, setDescription] = useState(initialValues.description || '');
    const [startDate, setStart] = useState(initialValues.startDate ? initialValues.startDate.slice(0, 10) : '');
    const [endDate, setEnd] = useState(initialValues.endDate ? initialValues.endDate.slice(0, 10) : '');
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

        if (!startDate) {
            setError('Start date is required');
            return;
        }

        if (!endDate) {
            setError('End date is required');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            if(new Date(startDate) > new Date(endDate)) {
                setError('End date must be after start date');
                setLoading(false);
                return;
            }
            const payload = {
                name: name.trim(),
                description: description.trim(),
                startDate: startDate,
                endDate: endDate
            };

            await onSubmit(payload);
        } catch (err) {
            console.error(err);
            setError(err.message || 'An error occurred while saving the sprint.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            {error && <p className="error-text">{error}</p>}

            <div className="form-group">
                <label htmlFor="sprint-name">Name</label>
                <input
                    id="sprint-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={loading}
                    required
                />
            </div>

            <div className="form-group">
                <label htmlFor="sprint-description">Description</label>
                <input
                    id="sprint-description"
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={loading}
                />
            </div>

            <div className="form-group">
                <label htmlFor="sprint-start">Start date</label>
                <input
                    id="sprint-start"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStart(e.target.value)}
                    disabled={loading}
                    required
                />
            </div>

            <div className="form-group">
                <label htmlFor="sprint-end">End date</label>
                <input
                    id="sprint-end"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEnd(e.target.value)}
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