import axios from "axios";
import { API_BASE_URL } from "../config.js";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  // Keep the existing fetch-style status handling in calling components.
  validateStatus: () => true,
});

export async function apiFetch(url, { method = "GET", headers, body } = {}) {
  const response = await api.request({
    url,
    method,
    headers,
    data: body,
  });

  return {
    ok: response.status >= 200 && response.status < 300,
    status: response.status,
    json: async () => response.data,
  };
}

export default api;
