import { useApi } from "./api";

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
        return await authFetch(`/projects/sprints/${sprintId}`, {
            method: 'PUT',
            body: JSON.stringify(updateData),
        });
    }
    
    const deleteSprint = async (sprintId) => {
        return await authFetch(`/projects/sprints/${sprintId}`, {
            method: 'DELETE',
        });
    }

    const assignUserStoriesToSprint = async (sprintId, userStoryIds) => {
        return await authFetch(`/projects/sprints/${sprintId}/assign`, {
            method: 'POST',
            body: JSON.stringify({ userStoryIds }),
        });
    }

    const startSprint = async (sprintId) => {
        return await authFetch(`/projects/sprints/${sprintId}/start`, {
            method: 'POST',
        });
    }

    const completeSprint = async (sprintId) => {
        return await authFetch(`/projects/sprints/${sprintId}/complete`, {
            method: 'POST',
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
