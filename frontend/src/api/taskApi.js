import { useApi } from "./api";

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

    return {
        createTask,
        getTasksByUserStory,
        updateTask,
        deleteTask,
    };
};
