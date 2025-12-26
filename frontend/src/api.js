// src/utils/api.js
import axios from "axios";

const api = axios.create({ baseURL: "http://localhost:5000/api" });

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Refresh token on 403
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 403) {
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        const res = await axios.post("http://localhost:5000/api/refresh", { refreshToken });
        localStorage.setItem("accessToken", res.data.accessToken);
        error.config.headers.Authorization = `Bearer ${res.data.accessToken}`;
        return axios(error.config); // retry original request
      }
    }
    return Promise.reject(error);
  }
);

export default api;