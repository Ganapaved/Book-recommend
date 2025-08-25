const API_URL = "http://localhost:5000"; // backend URL

export const authFetch = async (url, options = {}) => {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };
  return fetch(`${API_URL}${url}`, { ...options, headers });
};
