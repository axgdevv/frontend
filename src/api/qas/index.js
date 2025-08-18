import axios from "axios";

const api = axios.create({
  baseURL: `${process.env.SERVER_BASE_URL}/`,
});

export const executeQA = async (designSetDocuments) => {
  try {
    const response = await api.post(
      `qas/structural/execute`,
      designSetDocuments,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error) {
    // Handle error
    console.error("Error fetching user data:", error);
    throw error;
  }
};

export const fetchQAById = async (qaId) => {
  try {
    const response = await api.get(`qas/structural/${qaId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
};

export const deleteQAById = async (qaId, projectId, userId) => {
  try {
    const response = await api.post("qas/structural/delete", {
      id: qaId,
      project_id: projectId,
      user_id: userId,
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting QA:", error);
    throw error;
  }
};
