const API_URL = "http://localhost:5000"; // backend URL

export const authFetch = async (url, options = {}) => {
  const token = localStorage.getItem("token");
  const headers = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  if(!(options.body instanceof FormData)){
    headers["Content-Type"] = "application/json";
  }
  return fetch(`${API_URL}${url}`, { ...options, headers });
};
