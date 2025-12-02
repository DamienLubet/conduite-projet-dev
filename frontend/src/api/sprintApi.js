import { useApi } from "./api";

/**
 * Custom hook to interact with the Sprint API endpoints.
 */
export const sprintApi = () => {
    const { authFetch } = useApi();

    const createSprint = async (projectId, sprintData) => {
        return await authFetch(`/projects/${projectId}/sprints`, {
            method: 'POST',
            body: JSON.stringify(sprintData),
        });
    }

    const getSprintsByProject = async (projectId) => {
        return await authFetch(`/projects/${projectId}/sprints`);
    }

    const updateSprint = async (sprintId, updateData) => {
        return await authFetch(`/sprints/${sprintId}`, {
            method: 'PUT',
            body: JSON.stringify(updateData),
        });
    }
    
    const deleteSprint = async (sprintId) => {
        return await authFetch(`/sprints/${sprintId}`, {
            method: 'DELETE',
        });
    }

    const assignUserStoriesToSprint = async (sprintId, userStoriesIDs) => {
        return await authFetch(`/sprints/${sprintId}/userstories`, {
            method: 'POST',
            body: JSON.stringify({ userStoriesIDs }),
        });
    }

    const startSprint = async (sprintId) => {
        return await authFetch(`/sprints/${sprintId}/start`, {
            method: 'POST',
        });
    }

    const completeSprint = async (sprintId, type) => {
        return await authFetch(`/sprints/${sprintId}/complete`, {
            method: 'POST',
            body: JSON.stringify({ type }),
        });
    }

    return {
        createSprint,
        getSprintsByProject,
        updateSprint,
        deleteSprint,
        assignUserStoriesToSprint,
        startSprint,
        completeSprint,
    };
}
