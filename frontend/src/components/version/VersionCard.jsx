import { useState } from 'react';

/**
 * Component to display a version card with expandable details.
 * 
 * @param {Object} props - Component properties.
 * @param {Object} props.version - The version data to display.
 * @param {Function} props.onEdit - Callback function when the version card is clicked.
 */
export default function VersionCard({ version, onEdit }) {
    const [expanded, setExpanded] = useState(false);

    /**
     * Toggle the expanded state of the version details.
     * @param {Object} e - The click event.
     */
    const toggleExpanded = (e) => {
        e.stopPropagation();
        setExpanded(prev => !prev);
    };

    return (
        <div>
            <div className="version-item" onClick={() => onEdit(version)}>
                <div className="version-card-header" >
                    <div className="version-card-header-left">
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
                    </div>
                    <div className="version-card-header-right">
                        <span className="version-release-date">Release: {new Date(version.releaseDate).toLocaleDateString()}</span>
                    </div>
                </div>
                {expanded && (
                    <div className="version-details" style={{ marginTop: '0.7rem' }}>
                        <p>{version.description}</p>
                        
                    </div>
                )}
            </div>
            {expanded && (
                <div className="version-separator">
                    <div className="version-sprints" style={{ marginTop: '0.7rem' }}>Sprint {version.sprint.number}: {version.sprint.name}</div>
                </div>
            )}
        </div>
    );
}