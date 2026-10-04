import axios, { AxiosError } from "axios";

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : null;
}

const SAFE_METHODS = new Set(["get", "head", "options", "trace"]);

const http = axios.create({
  baseURL: "/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

http.interceptors.request.use((config) => {
  const method = config.method?.toLowerCase() ?? "get";
  if (!SAFE_METHODS.has(method)) {
    const token = getCookie("csrftoken");
    if (token) {
      config.headers = config.headers ?? {};
      config.headers["X-CSRFToken"] = token;
    }
  }
  return config;
});

export default http;

export function extractErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<any>;
    const data = axiosError.response?.data;
    if (typeof data === "string") {
      return data;
    }
    if (data && typeof data === "object") {
      if (typeof data.detail === "string") {
        return data.detail;
      }
      if (typeof data.error === "string") {
        return data.error;
      }
      const errors: string[] = [];
      Object.entries(data as Record<string, unknown>).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach((item) => {
            if (typeof item === "string") {
              errors.push(key === "non_field_errors" ? item : `${key}: ${item}`);
            }
          });
        } else if (typeof value === "string") {
          errors.push(key === "non_field_errors" ? value : `${key}: ${value}`);
        }
      });
      if (errors.length > 0) {
        return errors.join("\n");
      }
    }
    return axiosError.message || "A request error occurred.";
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "An unexpected error occurred.";
}
