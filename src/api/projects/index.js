import axios from "axios";

const api = axios.create({
  baseURL: `${process.env.SERVER_BASE_URL}/`,
});

export const fetchStructuralProjectsByUser = async (userId) => {
  try {
    const response = await api.post("projects/structural/get-all", {
      user_id: userId,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
};

export const createNewProject = async (projectData) => {
  try {
    const response = await api.post("projects/structural/create", {
      project_name: projectData.projectName,
      client_name: projectData.clientName,
      project_type: projectData.projectType,
      state: projectData.state,
      city: projectData.city,
      user_id: projectData.userId,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
};

export const fetchProjectById = async (id) => {
  try {
    const response = await api.get(`projects/structural/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching project data:", error);
    throw error;
  }
};

export const fetchProjectQAs = async (projectId) => {
  try {
    const response = await api.get(`projects/structural/${projectId}/qas`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
};

export const fetchProjectChecklists = async (projectId) => {
  try {
    const response = await api.get(
      `projects/structural/${projectId}/checklists`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
};
