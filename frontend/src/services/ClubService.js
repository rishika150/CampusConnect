import api from "../api/axios";

export const fetchClubs = async ({
  page = 0,
  size = 6,
  search = "",
  category,
} = {}) => {
  const response = await api.get("/clubs", {
    params: {
      page,
      size,
      search: search || undefined,
      category: category || undefined,
      sortBy: "createdAt",
      sortDirection: "desc",
    },
  });

  return response.data.data;
};

export const fetchMyClubs = async () => {
  const response = await api.get("/clubs/me");
  return response.data.data;
};

export const joinClub = async (clubId) => {
  const response = await api.post(`/clubs/${clubId}/join`);
  return response.data.data;
};

export const leaveClub = async (clubId) => {
  await api.delete(`/clubs/${clubId}/leave`);
};