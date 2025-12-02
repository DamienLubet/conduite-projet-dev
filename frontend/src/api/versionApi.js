import { useApi } from "./api";

/**
 * Custom hook to interact with the Version API endpoints.
 */
export const versionApi = () => {
    const { authFetch } = useApi();

    const getVersionsByProject = async (projectId) => {
        return await authFetch(`/projects/${projectId}/versions`);
    };

    const updateVersion = async (versionId, updateData) => {
        return await authFetch(`/versions/${versionId}`, {
            method: 'PUT',
            body: JSON.stringify(updateData),
        });
    };

    return {
        getVersionsByProject,
        updateVersion,
    };
};