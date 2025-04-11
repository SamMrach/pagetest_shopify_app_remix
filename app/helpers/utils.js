const API_URL = "https://app.pagetest.ai/api/";
import axios from "axios";
// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  if (config.url !== "auth/login") {
    const token = getAuthToken();
    if (result.token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});
// API endpoints
const login = async (email, password) => {
  try {
    const response = await api.post("auth/login", { email, password });
    return { success: true, token: response.data.token };
  } catch (error) {
    if (error.response?.status === 422) {
      return { success: false, error: error.response.data };
    }
    //throw error;
  }
};

const signOut = async () => {
  try {
    const response = await api.post("auth/logout");
    return { success: true };
  } catch (err) {
    console.log(err);
    return { success: false };
  }
};

const fetchSnippetToInject = async () => {
  try {
    const res = await api.get("/snippets/latest");
    console.log(res);
    return { success: true, snippet: res.code };
  } catch (err) {
    console.log(err);
    return { success: false, error: err };
  }
};

export { login, signOut, fetchSnippetToInject };
