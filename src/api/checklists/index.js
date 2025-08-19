import axios from "axios";
import { getAuthHeaders, getAuthHeadersForFormData } from "@/lib/auth";

const api = axios.create({
  baseURL: `${process.env.SERVER_BASE_URL}/`,
});

export const fetchChecklistById = async (checklistId) => {
  try {
    const headers = await getAuthHeaders();
    const response = await api.get(`checklists/structural/${checklistId}`, {
      headers,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
};

export const generateChecklist = async (checklistGenerationDocuments) => {
  try {
    const headers = await getAuthHeadersForFormData();
    const response = await api.post(
      `checklists/structural/generate`,
      checklistGenerationDocuments,
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

export const deleteChecklistById = async (checklistId, projectId, userId) => {
  try {
    const headers = await getAuthHeaders();
    const response = await api.post(
      "checklists/structural/delete",
      {
        checklist_id: checklistId,
        project_id: projectId,
        user_id: userId,
      },
      { headers }
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting checklist:", error);
    throw error;
  }
};
