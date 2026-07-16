import api from "../api/axios";

export const fetchEvents = async ({
  page = 0,
  size = 6,
  search = "",
  category,
  status,
  clubId,
} = {}) => {
  const response = await api.get("/events", {
    params: {
      page,
      size,
      search: search || undefined,
      category: category || undefined,
      status: status || undefined,
      clubId: clubId || undefined,
      sortBy: "startTime",
      sortDirection: "asc",
    },
  });

  return response.data.data;
};

export const fetchUpcomingEvents = async ({
  page = 0,
  size = 5,
} = {}) => {
  const response = await api.get("/events/upcoming", {
    params: { page, size },
  });

  return response.data.data;
};