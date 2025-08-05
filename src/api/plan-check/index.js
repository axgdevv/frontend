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
