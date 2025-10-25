import api from "./api";

export const sendSOS = async (to, message) => {
  return await api.post("/send-sos/", { to, body: message });
};
