const configuredApiBase = import.meta.env.VITE_API_BASE_URL || "https://pollify-backend-red.vercel.app/api";

// VITE_API_BASE_URL must include the backend's /api route prefix.
export const API_BASE_URL = configuredApiBase.replace(/\/+$/, "");
