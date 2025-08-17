import axios from "axios";

const api = axios.create({
  baseURL: `${process.env.SERVER_BASE_URL}/`,
});

export const fetchChecklistById = async (checklistId) => {
  try {
    const response = await api.get(`checklists/structural/${checklistId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
};

export const generateChecklist = async (checklistGenerationDocuments) => {
  try {
    const response = await api.post(
      `checklists/structural/generate`,
      checklistGenerationDocuments,
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

export const deleteChecklistById = async (checklistId) => {
  try {
    const response = await api.post("checklists/structural/delete", {
      checklist_id: checklistId,
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting checklist:", error);
    throw error;
  }
};
