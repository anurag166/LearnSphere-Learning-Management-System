import axios from "axios";

export const apiConnector = async (method, url, body = null, headers = {}) => {
  try {
    const response = await axios({
      method,
      url,
      data: body,
      headers,
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("API error:", error.response?.data || error.message);
    throw error;
  }
};
