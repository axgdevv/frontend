import axios from "axios";

const api = axios.create({
  baseURL: `${process.env.SERVER_BASE_URL}/`,
});

export const executePlanCheck = async (designSetDocuments) => {
  try {
    const response = await api.post(`plan-check/execute`, designSetDocuments, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error) {
    // Handle error
    console.error("Error fetching user data:", error);
    throw error;
  }
};

export const fetchPlanChecksByUser = async (userId) => {
  try {
    const response = await api.post(
      "plan-check/structural/get-user-plan-checks",
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

export const fetchPlanCheckById = async (planCheckId) => {
  try {
    const response = await api.post(
      "plan-check/structural/get-plan-check-by-id",
      {
        plan_check_id: planCheckId,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
};

export const ingestCityComments = async (cityCommentDocuments) => {
  try {
    const response = await api.post(
      `plan-check/structural/ingest-city-comments`,
      cityCommentDocuments,
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

// Todo: Move to checklist or bring all checklist folder apis to this file
export const generateChecklist = async (checklistGenerationDocuments) => {
  try {
    const response = await api.post(
      `plan-check/structural/generate-checklist`,
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

export const updatePlanCheck = async (planCheckId, projectInfo) => {
  try {
    const response = await api.post("plan-check/structural/update-plan-check", {
      plan_check_id: planCheckId,
      project_info: projectInfo,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
};

export const deletePlanCheckById = async (planCheckId) => {
  try {
    const response = await api.post("plan-check/structural/delete-plan-check", {
      plan_check_id: planCheckId,
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting checklist:", error);
    throw error;
  }
};
