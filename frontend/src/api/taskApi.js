import { useApi } from "./api";

/**
 * Custom hook to interact with the Task API endpoints.
 */
export const taskApi = () => {
    const { authFetch } = useApi();

    const createTask = async (userStoryId, taskData) => {
        return await authFetch(`/userstories/${userStoryId}/tasks`, {
            method: 'POST',
            body: JSON.stringify(taskData),
        });
    };

    const getTasksByUserStory = async (userStoryId) => {
        return await authFetch(`/userstories/${userStoryId}/tasks`);
    };

    const updateTask = async (taskId, updateData) => {
        return await authFetch(`/tasks/${taskId}`, {
            method: 'PUT',
            body: JSON.stringify(updateData),
        });
    };

    const deleteTask = async (taskId) => {
        return await authFetch(`/tasks/${taskId}`, {
            method: 'DELETE',
        });
    };

    const assignTask = async (taskId, assigneeData) => {
        return await authFetch(`/tasks/${taskId}/assign`, {
            method: 'PUT',
            body: JSON.stringify(assigneeData),
        });
    };

    return {
        createTask,
        getTasksByUserStory,
        updateTask,
        deleteTask,
        assignTask,
    };
};
