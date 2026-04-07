const BASE_URL = import.meta.env.VITE_API_BASE_URL;

async function request(path, options = {}) {
  const token = localStorage.getItem("token");

  const headers = {
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Don't set Content-Type for FormData — browser sets it with boundary
  if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    window.location.href = "/signin";
    throw new Error("Unauthorized");
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.detail || `Request failed: ${response.status}`);
  }

  return response.json();
}

export const apiClient = {
  get: (path, options = {}) => request(path, { ...options, method: "GET" }),
  
  post: (path, body, options = {}) => {
    // If it's FormData (like login), we don't stringify it.
    // If it's a regular object, we stringify it for the backend.
    const isFormData = body instanceof FormData;
    return request(path, {
      ...options,
      method: "POST",
      body: isFormData ? body : JSON.stringify(body),
    });
  },

  patch: (path, body, options = {}) =>
    request(path, {
      ...options,
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  delete: (path, options = {}) => request(path, { ...options, method: "DELETE" }),
};
