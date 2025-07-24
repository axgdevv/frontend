import axios from "axios";

const api = axios.create({
  baseURL: `${process.env.SERVER_BASE_URL}/`,
});

export const checkConnection = async () => {
  try {
    const response = await api.get(`check-connection`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
};
