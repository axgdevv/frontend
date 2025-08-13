import axios from "axios";

const api = axios.create({
  baseURL: `${process.env.SERVER_BASE_URL}/`,
});

export const signInWithGoogleAPI = async (userData) => {
  try {
    const response = await api.post(`users/signin-google`, { ...userData });
    return response.data;
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
};
