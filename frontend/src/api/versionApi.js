import { useApi } from "./api";

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