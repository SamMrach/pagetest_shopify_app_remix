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

const getAuthToken = () => {
  return localStorage.getItem("pagetest_authToken");
};

const fetchPages = async (shop, accessToken) => {
  try {
    const response = await fetch(
      `https://${shop}/admin/api/2024-01/pages.json`,
      {
        method: "GET",
        headers: {
          "X-Shopify-Access-Token": accessToken,
          "Content-Type": "application/json",
        },
      },
    );
    return { success: true, pages: response.json() };
  } catch (err) {
    return { success: false, error: err };
  }
};

const fetchProducts = async (shop, accessToken) => {
  try {
    const response = await fetch(
      `https://${shop}/admin/api/2024-01/products.json`,
      {
        method: "GET",
        headers: {
          "X-Shopify-Access-Token": accessToken,
          "Content-Type": "application/json",
        },
      },
    );
    return { success: true, products: response.json() };
  } catch (err) {
    return { success: false, error: err };
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

const getSelectedPages = () => {
  return JSON.parse(localStorage.getItem("pagetest_selectedPages")) || [];
};
const getSelectedProducts = () => {
  return JSON.parse(localStorage.getItem("pagetest_selectedProducts")) || [];
};

// Function to register a script tag via Shopify API
const registerScriptTag = async (shop, accessToken) => {
  try {
    // This would create a persistent script tag via Shopify Admin API
    const response = await fetch(
      `https://${shop}/admin/api/2024-01/script_tags.json`,
      {
        method: "POST",
        headers: {
          "X-Shopify-Access-Token": accessToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          script_tag: {
            event: "onload",
            src: "https://app.pagetest.ai/js/injectedScript.js", // Your script URL
          },
        }),
      },
    );

    const data = await response.json();
    return { success: true, scriptTag: data.script_tag };
  } catch (err) {
    console.error("Error registering script tag:", err);
    return { success: false, error: err };
  }
};

export {
  login,
  signOut,
  getAuthToken,
  fetchPages,
  fetchProducts,
  fetchSnippetToInject,
  getSelectedPages,
  getSelectedProducts,
  registerScriptTag,
};
