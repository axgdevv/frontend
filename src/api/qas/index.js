import axios from "axios";
import { getAuthHeaders, getAuthHeadersForFormData } from "@/lib/auth";

const api = axios.create({
  baseURL: `${process.env.SERVER_BASE_URL}/`,
});

export const executeQA = async (designSetDocuments) => {
  try {
    const headers = await getAuthHeadersForFormData();
    const response = await api.post(
      `qas/structural/execute`,
      designSetDocuments,
      {
        headers: {
          ...headers,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
};

export const fetchQAById = async (qaId) => {
  try {
    const headers = await getAuthHeaders();
    const response = await api.get(`qas/structural/${qaId}`, { headers });
    return response.data;
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
};

export const deleteQAById = async (qaId, projectId, userId) => {
  try {
    const headers = await getAuthHeaders();
    const response = await api.post(
      "qas/structural/delete",
      {
        id: qaId,
        project_id: projectId,
        user_id: userId,
      },
      { headers }
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting QA:", error);
    throw error;
  }
};
