import axios from "axios";

const api = axios.create({
  baseURL: `${process.env.SERVER_BASE_URL}/`,
});

export const ingestCityComments = async (cityCommentDocuments) => {
  try {
    const response = await api.post(
      `knowledgebase/structural/ingest-city-comments`,
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
