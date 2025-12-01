import { useState } from 'react';

export default function VersionCard({ version, onEdit }) {
    const [expanded, setExpanded] = useState(false);
    return (
        <li className="version-item">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                    <button
                        className="expand-version-btn"
                        style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', fontSize: '1.2rem' }}
                        onClick={() => setExpanded(e => !e)}
                        aria-label={expanded ? 'Réduire' : 'Voir détails'}
                    >
                        {expanded ? '▲' : '▼'}
                    </button>
                    <span className="version-tag" style={{ fontWeight: 'bold', color: '#60a5fa', fontSize: '1.1rem' }}>{version.tag}</span>
                </div>
                <button
                    className="edit-version-btn"
                    style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: '1.1rem', marginLeft: '0.5rem' }}
                    onClick={onEdit}
                    aria-label="Edit"
                >
                    ✎
                </button>
            </div>
            {expanded && (
                <div className="version-details" style={{ marginTop: '0.7rem' }}>
                    <p>{version.description}</p>
                    <p>Released on: {new Date(version.releaseDate).toLocaleDateString()}</p>
                    <p>Sprint: {version.sprint ? `${version.sprint.name} (Number: ${version.sprint.number})` : 'No sprint assigned'}</p>
                </div>
            )}
        </li>
    );
}