import { auth } from "./firebase"; // Your Firebase config
import { getIdToken } from "firebase/auth";

export const getAuthHeaders = async () => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("User not authenticated");
  }

  const token = await getIdToken(user);
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

export const getAuthHeadersForFormData = async () => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("User not authenticated");
  }

  const token = await getIdToken(user);
  return {
    Authorization: `Bearer ${token}`,
  };
};
