import axios from "axios";

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE + "/api",
});

http.interceptors.response.use(
  (r) => r,
  (e) => {
    console.error("API error", e?.response || e);
    return Promise.reject(e);
  }
);
