import { useEffect, useState } from 'react';
import { sprintApi } from '../../api/sprintApi.js';
import { userStoryApi } from '../../api/userstoryApi.js';

export default function SprintAssignUS({ sprint, onUpdated }) {
    const [userStories, setUserStories] = useState([]);
    const [selectedUserStories, setSelectedUserStories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const { assignUserStoriesToSprint } = sprintApi();
    const { getUserStoriesByProject } = userStoryApi();

    useEffect(() => {
        fetchUserStories();
    }, []);

    const fetchUserStories = async () => {
        try {
            setLoading(true);
            const res = await getUserStoriesByProject(sprint.project);
            setUserStories(res.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const assignUSToSprint = async (usId) => {
        try {
            await assignUserStoriesToSprint(sprint._id, usId);
            await onUpdated();
        } catch (err) {
            setError(err.message);
        }
    };

    const toggleUserStory = (id) => {
        setSelectedUserStories(prev =>
            prev.includes(id)
            ? prev.filter(selectedId => selectedId !== id)
            : [...prev, id]
        );
    };

    const handleAssign = () => {
        assignUSToSprint(selectedUserStories);
    };

    const filteredUserStories = Array.isArray(userStories)
        ? userStories.filter((us) => {
            const term = searchTerm.trim().toLowerCase();
            if (!term) return true;
            const title = (us.title || '').toLowerCase();
            const number = us.number != null ? String(us.number).toLowerCase() : '';
            return title.includes(term) || number.includes(term);
        })
        : [];


    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="modal-backdrop">
            <div className="modal">
            <h3>Assign User Stories to {sprint.name}</h3>

            {error && <p className="modal-error">Error: {error}</p>}

            <div className="assign-us-search">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by number or title..."
                />
            </div>

            <div className="assign-us-list">
                {filteredUserStories.length > 0 ? (
                filteredUserStories.map((us) => (
                    <label
                    key={us._id}
                    className={`assign-us-item ${
                        selectedUserStories.includes(us._id) ? 'assign-us-item--selected' : ''
                    }`}
                    >
                    <input
                        type="checkbox"
                        checked={selectedUserStories.includes(us._id)}
                        onChange={() => toggleUserStory(us._id)}
                    />
                    <div className="assign-us-content">
                            <span className="assign-us-title">US{us.number}: {us.title}</span>
                        
                    </div>
                    </label>
                ))
                ) : (
                <p className="assign-us-empty">No user stories available</p>
                )}
            </div>

            <div className="modal-actions">
                <button type="button" onClick={onUpdated}>
                Close
                </button>
                <button
                type="submit"
                onClick={handleAssign}
                disabled={selectedUserStories.length === 0}
                >
                Assign Selected
                </button>
            </div>
            </div>
        </div>
    );
}