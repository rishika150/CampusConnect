import api from "../api/axios";

export async function createClub(payload) {
  const response = await api.post("/clubs", payload);
  return response.data.data;
}
export async function createEvent(payload) {
  const response = await api.post("/events", payload);
  return response.data.data;
}
export async function updateEvent(eventId, payload) {
  const response = await api.put(`/events/${encodeURIComponent(eventId)}`, payload);
  return response.data.data;
}
export async function removeEvent(eventId) {
  await api.delete(`/events/${encodeURIComponent(eventId)}`);
}
