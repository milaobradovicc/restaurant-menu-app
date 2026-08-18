export const API_BASE_URL = (import.meta.env.VITE_BACKEND_URL || "").replace(/\/$/, "");

export function apiUrl(path) {
  return `${API_BASE_URL}${path}`;
}

export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem("token");
  const headers = new Headers(options.headers || {});
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const response = await fetch(apiUrl(path), { ...options, headers });
  if (response.status === 401 && token) {
    localStorage.removeItem("token");
    if (window.location.pathname.startsWith("/admin")) window.location.assign("/login");
  }
  if (!response.ok) {
    const data = await response.clone().json().catch(() => ({}));
    throw new Error(data.message || "Zahtev nije uspeo.");
  }
  return response;
}

export async function readJson(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Zahtev nije uspeo.");
  return data;
}

export function hasValidToken(token = localStorage.getItem("token")) {
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return Number(payload.exp) * 1000 > Date.now();
  } catch (_error) {
    return false;
  }
}
