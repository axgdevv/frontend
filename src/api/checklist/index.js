import axios from "axios";

const api = axios.create({
  baseURL: `${process.env.SERVER_BASE_URL}/`,
});

export const fetchChecklistsByUser = async (userId) => {
  try {
    const response = await api.post(
      "plan-check/structural/get-user-checklists",
      {
        user_id: userId,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
};

export const fetchChecklistById = async (checklistId) => {
  try {
    const response = await api.post(
      "plan-check/structural/get-checklist-by-id",
      {
        checklist_id: checklistId,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
};

export const createChecklist = async (
  checklist_id,
  user_id,
  checklist_data
) => {
  try {
    const response = await api.post(`plan-check/structural/create-checklist`, {
      checklist_id,
      user_id,
      checklist_data,
    });

    return response.data;

    return [];
  } catch (error) {
    // Handle error
    console.error("Error fetching user data:", error);
    throw error;
  }
};

export async function updateChecklist(checklistId, projectInfo) {
  try {
    const response = await api.post("plan-check/structural/update-checklist", {
      checklist_id: checklistId,
      project_info: projectInfo,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
}

export const deleteChecklistById = async (checklistId) => {
  try {
    const response = await api.post("plan-check/structural/delete-checklist", {
      checklist_id: checklistId,
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting checklist:", error);
    throw error;
  }
};
