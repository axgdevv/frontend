import axios from "axios";
import { getAuthHeaders } from "@/lib/auth";

const api = axios.create({
  baseURL: `${process.env.SERVER_BASE_URL}/`,
});

export const fetchStructuralProjectsByUser = async (userId, options) => {
  try {
    const { page = 1, limit = 4, search = "", status } = options;
    const headers = await getAuthHeaders();

    const response = await api.post(
      "projects/structural/get-all",
      {
        user_id: userId,
        page,
        limit,
        search,
        status,
      },
      { headers }
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
};

export const createNewProject = async (projectData) => {
  try {
    const headers = await getAuthHeaders();
    const response = await api.post(
      "projects/structural/create",
      {
        project_name: projectData.projectName,
        client_name: projectData.clientName,
        project_type: projectData.projectType,
        state: projectData.state,
        city: projectData.city,
        user_id: projectData.userId,
      },
      { headers }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
};

export const updateProjectStatus = async (projectData) => {
  try {
    const headers = await getAuthHeaders();
    const response = await api.post(
      "projects/structural/update",
      {
        id: projectData._id,
        status: projectData.status,
      },
      { headers }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
};

export const deleteProject = async (projectData) => {
  try {
    const headers = await getAuthHeaders();
    const response = await api.post(
      "projects/structural/delete",
      {
        id: projectData._id,
        user_id: projectData.userId,
      },
      { headers }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
};

export const fetchProjectById = async (id) => {
  try {
    const headers = await getAuthHeaders();
    const response = await api.get(`projects/structural/${id}`, { headers });
    return response.data;
  } catch (error) {
    console.error("Error fetching project data:", error);
    throw error;
  }
};

export const fetchProjectQAs = async (projectId, page = 1, limit = 4) => {
  try {
    const headers = await getAuthHeaders();
    const response = await api.get(
      `projects/structural/${projectId}/qas?page=${page}&limit=${limit}`,
      { headers }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
};

export const fetchProjectChecklists = async (
  projectId,
  page = 1,
  limit = 4
) => {
  try {
    const headers = await getAuthHeaders();
    const response = await api.get(
      `projects/structural/${projectId}/checklists?page=${page}&limit=${limit}`,
      { headers }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
};
