import { useState } from 'react';

/**
 * Generic delete confirmation modal.
 *
 * @param {Object} props - Component properties.
 * @param {string} props.title - Modal title.
 * @param {string} props.itemLabel - Label for the item (e.g. name or title).
 * @param {Function} props.onConfirm - Async function called on confirm.
 * @param {Function} props.onCancel - Function called on cancel.
 * @param {string} [props.errorPrefix] - Optional prefix for error messages.
 * @return {JSX.Element} The rendered delete confirmation modal.
 */
export default function DeleteConfirmModal({
  title,
  itemLabel,
  onConfirm,
  onCancel,
  errorPrefix = 'An error occurred while deleting',
}) {
  const [error, setError] = useState(null);

  const handleConfirm = async () => {
      try {
      setError(null);
        await onConfirm();
    } catch (err) {
      setError(err.message || `${errorPrefix}.`);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>{title}</h3>
        {error && <p className="error-text">{error}</p>}
        <p>
          Are you sure you want to delete{' '}
          <strong>{itemLabel}</strong>
          ?
        </p>
        <div className="modal-actions">
          <button type="button" className="cancel-button" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="danger-button" onClick={handleConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
