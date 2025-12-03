import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { versionApi } from '../../api/versionApi';
import VersionEdit from './VersionEdit.jsx';
import VersionCard from './VersionCard.jsx';
import '../../styles/versionStyle.css';

/**
 * Component to display a list of versions for a project.
 */
export default function VersionList() {
    const { getVersionsByProject } = versionApi();
    const { projectId } = useParams();

    const [versions, setVersions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [modalState, setModalState] = useState({ type: null, data: null });
    const closeModal = () => setModalState({ type: null, data: null });

    /**
     * Fetch versions for the current project.
     */
    const fetchVersions = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getVersionsByProject(projectId);
            setVersions(res.versions);
        } catch (err) {
            setError('Failed to load versions.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVersions();
    }, [projectId]);

    return (
        <div className="version-page">
            {loading && <p>Loading...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}

            <div className="version-list-container">
                <h3>Releases </h3>
                <ul className="version-list">
                    {Array.isArray(versions) && versions.map((ver) => (
                        <VersionCard 
                            key={ver._id} 
                            version={ver} 
                            onEdit={() => setModalState({ type: 'EDIT', data: ver })} 
                        />
                    ))}
                </ul>
            </div>

            {modalState.type === 'EDIT' && (
                <VersionEdit 
                    version={modalState.data}
                    onUpdated={() => {
                        closeModal();
                        fetchVersions();
                    }}
                    onCancel={() => {
                        closeModal();
                    }}
                />
            )}
        </div>
    );
}