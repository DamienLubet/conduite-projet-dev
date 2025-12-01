import { useState, useEffect } from 'react';
import { sprintApi } from '../../api/sprintApi.js';
import { userStoryApi } from '../../api/userstoryApi.js';

export default function SprintAssignUS({ sprint, onUpdated }) {
    const [userStories, setUserStories] = useState([]);
    const [selectedUserStories, setSelectedUserStories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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


    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <h2>Assign User Stories to Sprint</h2>
            <ul>
                {Array.isArray(userStories) ? (
                    userStories.map((us) => (
                        <li key={us._id}>
                            <input
                                type="checkbox"
                                checked={selectedUserStories.includes(us._id)}
                                onChange={() => toggleUserStory(us._id)}
                            />
                            {us.title}
                            <button onClick={handleAssign}>Assign Selected</button>
                        </li>
                    ))
                ) : (
                    <p>No user stories available</p>
                )}
            </ul>
        </div>
    );
}