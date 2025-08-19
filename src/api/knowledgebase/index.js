// api/admin.js - Updated with Firebase authentication
import axios from "axios";
import { getAuthHeadersForFormData } from "@/lib/auth";

const api = axios.create({
  baseURL: `${process.env.SERVER_BASE_URL}/`,
});

export const ingestCityComments = async (cityCommentDocuments) => {
  try {
    const headers = await getAuthHeadersForFormData();
    const response = await api.post(
      `knowledgebase/structural/ingest-city-comments`,
      cityCommentDocuments,
      {
        headers: {
          ...headers,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error) {
    // Handle error
    console.error("Error ingesting city comments:", error);
    throw error;
  }
};
