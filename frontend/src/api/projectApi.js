import { useApi } from "./api";

export const projectApi = () => {
    const { authFetch } = useApi();

    const createProject = async (projectData) => {
        return await authFetch(`/projects`, {
            method: 'POST',
            body: JSON.stringify(projectData),
        });
    };

    const getProjects = async () => {
        return await authFetch(`user/projects`);
    };

    const getProjectById = async (projectId) => {
        return await authFetch(`/projects/${projectId}`);
    };

    const updateProject = async (projectId, updateData) => {
        return await authFetch(`/projects/${projectId}`, {
            method: 'PUT',
            body: JSON.stringify(updateData),
        });
    };

    const deleteProject = async (projectId) => {
        return await authFetch(`/projects/${projectId}`, {
            method: 'DELETE',
        });
    };

    return {
        createProject,
        getProjects,
        getProjectById,
        updateProject,
        deleteProject,
    };
};