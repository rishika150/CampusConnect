import api from "../api/axios";

export const loginUser = async (credentials) => {
  const response = await api.post("/auth/login", credentials);
  return response.data.data;
};

export const registerUser = async (formData) => {
  const response = await api.post("/auth/register", formData);
  return response.data.data;
};

export const fetchCurrentUser = async () => {
  const response = await api.get("/users/me");
  return response.data.data;
};