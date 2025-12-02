import { useApi } from "./api";

/**
 * Custom hook to interact with the Project API endpoints.
 */
export const projectApi = () => {
    const { authFetch } = useApi();

    const createProject = async (projectData) => {
        return await authFetch(`/projects`, {
            method: 'POST',
            body: JSON.stringify(projectData),
        });
    };

    const getProjects = async () => {
        return await authFetch(`/user/projects`);
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

    const addProjectMember = async (projectId, memberData) => {
        return await authFetch(`/projects/${projectId}/members`, {
            method: 'POST',
            body: JSON.stringify(memberData),
        });
    };

    const removeProjectMember = async (projectId, memberData) => {
        return await authFetch(`/projects/${projectId}/members`, {
            method: 'DELETE',
            body: JSON.stringify(memberData),
        });
    };

    const changeProjectMemberRole = async (projectId, memberData) => {
        return await authFetch(`/projects/${projectId}/members`, {
            method: 'PUT',
            body: JSON.stringify(memberData),
        });
    };

    return {
        createProject,
        getProjects,
        getProjectById,
        updateProject,
        deleteProject,
        addProjectMember,
        removeProjectMember,
        changeProjectMemberRole,
    };
};