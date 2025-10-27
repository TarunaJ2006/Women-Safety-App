import api from "./api";

export const sendSOS = async (phoneNumber, message, latitude = null, longitude = null) => {
  try {
    const res = await api.post("/emergency/send-sos", {
      phone_number: phoneNumber,
      message,
      latitude,
      longitude,
    });
    return res.data;
  } catch (error) {
    console.error("❌ Error sending SOS:", error);
    throw error;
  }
};

export const testTwilio = async (phoneNumber) => {
  try {
    const res = await api.post("/twilio/test", null, {
      params: { number: phoneNumber },
    });
    return res.data;
  } catch (error) {
    console.error("❌ Error testing Twilio:", error);
    throw error;
  }
};
