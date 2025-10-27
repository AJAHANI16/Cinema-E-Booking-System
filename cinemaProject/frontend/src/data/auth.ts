// src/data/auth.ts — Authentication and Profile API helpers

const API_URL = "http://localhost:8000/api";

/* ====== Interfaces ====== */
export interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  date_joined: string;
  street_address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  subscribed_to_promotions?: boolean;
}

export interface LoginData {
  email?: string;
  username?: string;
  password: string;
  remember_me?: boolean;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  first_name?: string;
  last_name?: string;
  subscribed_to_promotions?: boolean;
}

export interface AuthResponse {
  message: string;
  user: User;
}

export interface AuthStatusResponse {
  isAuthenticated: boolean;
  user?: User;
}

/* ====== Utilities ====== */

// Read a cookie value by name
function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : null;
}

// Build JSON headers; include CSRF when needed
function jsonHeaders(includeCsrf = false): HeadersInit {
  const base: HeadersInit = { "Content-Type": "application/json" };
  if (includeCsrf) {
    const csrf = getCookie("csrftoken") || "";
    return { ...base, "X-CSRFToken": csrf };
  }
  return base;
}

// Turn DRF error objects into readable strings
function parseValidationErrors(data: unknown): string {
  if (typeof data === "string") return data;

  if (typeof data === "object" && data !== null) {
    const d = data as Record<string, unknown>;
    if (typeof d.error === "string") return d.error;
    if (typeof d.message === "string") return d.message;

    const errors: string[] = [];
    if (Array.isArray(d.non_field_errors)) {
      errors.push(...(d.non_field_errors as string[]));
    }

    for (const key of Object.keys(d)) {
      if (key === "non_field_errors") continue;
      const val = d[key];
      if (Array.isArray(val)) {
        (val as string[]).forEach((msg) => errors.push(`${key}: ${msg}`));
      } else if (typeof val === "string") {
        errors.push(`${key}: ${val}`);
      }
    }

    if (errors.length > 0) return errors.join("\n");
  }

  return "An unexpected error occurred.";
}

// Unified fetch handler with JSON + error parsing
async function handleResponse<T>(res: Response): Promise<T> {
  let data: unknown;
  try {
    data = await res.json();
  } catch {
    throw new Error("Invalid server response");
  }

  if (!res.ok) throw new Error(parseValidationErrors(data));
  return data as T;
}

/* ====== Auth API ====== */

export async function registerUser(userData: RegisterData): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/auth/register/`, {
    method: "POST",
    headers: jsonHeaders(false),
    credentials: "include",
    body: JSON.stringify(userData),
  });
  return handleResponse<AuthResponse>(res);
}

export async function loginUser(loginData: LoginData): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/auth/login/`, {
    method: "POST",
    headers: jsonHeaders(false),
    credentials: "include",
    body: JSON.stringify(loginData),
  });
  return handleResponse<AuthResponse>(res);
}

export async function logoutUser(): Promise<{ message: string }> {
  const res = await fetch(`${API_URL}/auth/logout/`, {
    method: "POST",
    headers: jsonHeaders(true),
    credentials: "include",
  });
  return handleResponse<{ message: string }>(res);
}

export async function checkAuthStatus(): Promise<AuthStatusResponse> {
  try {
    const res = await fetch(`${API_URL}/auth/status/`, { credentials: "include" });
    if (!res.ok) return { isAuthenticated: false };
    return (await res.json()) as AuthStatusResponse;
  } catch {
    return { isAuthenticated: false };
  }
}

/* ====== Profile & Password ====== */

export async function getUserProfile(): Promise<{ user: User }> {
  const res = await fetch(`${API_URL}/auth/profile/`, { credentials: "include" });
  return handleResponse<{ user: User }>(res);
}

export async function updateProfile(payload: Partial<User>) {
  const res = await fetch(`${API_URL}/auth/profile/`, {
    method: "PUT",
    headers: jsonHeaders(true),
    credentials: "include",
    body: JSON.stringify(payload),
  });
  return handleResponse<{ message: string; user: User }>(res);
}

export async function changePassword(
  current_password: string,
  new_password: string,
  new_password_confirm: string
) {
  const res = await fetch(`${API_URL}/auth/change-password/`, {
    method: "POST",
    headers: jsonHeaders(true),
    credentials: "include",
    body: JSON.stringify({ current_password, new_password, new_password_confirm }),
  });
  return handleResponse<{ message: string }>(res);
}

/* ====== Password Reset ====== */

export async function requestPasswordReset(email: string) {
  const res = await fetch(`${API_URL}/auth/password-reset/request/`, {
    method: "POST",
    headers: jsonHeaders(false),
    credentials: "include",
    body: JSON.stringify({ email }),
  });
  return handleResponse<{ message: string }>(res);
}

export async function resetPassword(
  token: string,
  new_password: string,
  new_password_confirm: string
) {
  // Matches your backend: path('auth/password-reset/<str:token>/', reset_password, ...)
  const res = await fetch(`${API_URL}/auth/password-reset/${token}/`, {
    method: "POST",
    headers: jsonHeaders(false),
    credentials: "include",
    body: JSON.stringify({ new_password, new_password_confirm }),
  });
  return handleResponse<{ message: string }>(res);
}

/* ====== Payment Cards ====== */

export interface PaymentCard {
  id: number;
  card_number_masked: string;
  card_holder_name: string;
  expiry_month: number;
  expiry_year: number;
  billing_street: string;
  billing_city: string;
  billing_state: string;
  billing_zip: string;
  is_default: boolean;
  created_at: string;
}

export async function listCards(): Promise<PaymentCard[]> {
  const res = await fetch(`${API_URL}/auth/payment-cards/`, { credentials: "include" });
  return handleResponse<PaymentCard[]>(res);
}

export async function addCard(payload: {
  card_number: string;
  card_holder_name: string;
  expiry_month: number;
  expiry_year: number;
  cvv: string;
  billing_street: string;
  billing_city: string;
  billing_state: string;
  billing_zip: string;
  is_default?: boolean;
}) {
  const res = await fetch(`${API_URL}/auth/payment-cards/`, {
    method: "POST",
    headers: jsonHeaders(true),
    credentials: "include",
    body: JSON.stringify(payload),
  });
  return handleResponse<{ message: string; card: PaymentCard }>(res);
}

export async function updateCard(
  card_id: number,
  payload: Partial<Omit<Parameters<typeof addCard>[0], "cvv" | "card_number">>
) {
  const res = await fetch(`${API_URL}/auth/payment-cards/${card_id}/`, {
    method: "PUT",
    headers: jsonHeaders(true),
    credentials: "include",
    body: JSON.stringify(payload),
  });
  return handleResponse<{ message: string; card: PaymentCard }>(res);
}

export async function deleteCard(card_id: number) {
  const res = await fetch(`${API_URL}/auth/payment-cards/${card_id}/`, {
    method: "DELETE",
    headers: jsonHeaders(true),
    credentials: "include",
  });
  if (res.status === 204) return { message: "Deleted successfully" };
  return handleResponse<{ message: string }>(res);
}