import { useApi } from "./api";

/**
 * Custom hook to interact with the User Story API endpoints.
 */
export function userStoryApi() {
    const { authFetch } = useApi();

    const createUserStory = async (projectId, userStoryData) => {
        return await authFetch(`/projects/${projectId}/userstories`, {
            method: 'POST',
            body: JSON.stringify(userStoryData),
        });
    };

    const getUserStoriesByProject = async (projectId) => {
        return await authFetch(`/projects/${projectId}/userstories`);
    };

    const getUserStoryById = async (userStoryId) => {
        return await authFetch(`/userstories/${userStoryId}`);
    };

    const updateUserStory = async (userStoryId, updateData) => {
        return await authFetch(`/userstories/${userStoryId}`, {
            method: 'PUT',
            body: JSON.stringify(updateData),
        });
    };

    const deleteUserStory = async (userStoryId) => {
        return await authFetch(`/userstories/${userStoryId}`, {
            method: 'DELETE',
        });
    };

    return {
        createUserStory,
        getUserStoriesByProject,
        getUserStoryById,
        updateUserStory,
        deleteUserStory,
    };
}