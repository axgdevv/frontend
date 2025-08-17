import axios from "axios";

const api = axios.create({
  baseURL: `${process.env.SERVER_BASE_URL}/`,
});

export const fetchDashboardData = async (userId) => {
  try {
    console.log(userId);
    const response = await api.post("/dashboard/structural/stats", {
      user_id: userId,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
};
