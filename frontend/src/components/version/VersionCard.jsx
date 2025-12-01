import { useState } from 'react';

export default function VersionCard({ version, onEdit }) {
    const [expanded, setExpanded] = useState(false);

    const toggleExpanded = (e) => {
        e.stopPropagation();
        setExpanded(prev => !prev);
    };

    return (
        <div>
            <li className="version-item" onClick={() => onEdit(version)}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                        <button 
                            onClick={(e) => toggleExpanded(e)}
                            className="expand-tasks-button"
                            style={{transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)'}}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>
                        </button>
                        <span className="version-tag" style={{ fontWeight: 'bold', color: '#60a5fa', fontSize: '1.1rem' }}>{version.tag}</span>
                        <p className="version-release-date">Released on: {new Date(version.releaseDate).toLocaleDateString()}</p>
                    </div>
                </div>
                {expanded && (
                    <div className="version-details" style={{ marginTop: '0.7rem' }}>
                        <p>{version.description}</p>
                        
                    </div>
                )}
            </li>
            {expanded && (
                <div className="version-sprints" style={{ marginTop: '0.7rem' }}>Sprint {version.sprint.number}: {version.sprint.name}</div>
            )}
        </div>
    );
}