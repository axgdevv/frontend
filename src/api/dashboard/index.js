// api/dashboard.js
import axios from "axios";
import { getAuthHeaders } from "@/lib/auth";

const api = axios.create({
  baseURL: `${process.env.SERVER_BASE_URL}/`,
});

export const fetchDashboardData = async (userId) => {
  try {
    const headers = await getAuthHeaders();
    const response = await api.post(
      "/dashboard/structural/stats",
      {
        user_id: userId,
      },
      { headers }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
};
