// Authentication API functions
const API_URL = "http://127.0.0.1:8000/api";

export interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  date_joined: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  first_name?: string;
  last_name?: string;
}

export interface AuthResponse {
  message: string;
  user: User;
}

export interface AuthStatusResponse {
  isAuthenticated: boolean;
  user?: User;
}

// Helper function to get CSRF token
async function getCSRFToken(): Promise<string> {
  const response = await fetch(`${API_URL}/auth/status/`, {
    credentials: 'include',
  });
  const csrfToken = response.headers.get('X-CSRFToken');
  return csrfToken || '';
}

// Helper function to parse Django REST Framework validation errors
function parseValidationErrors(data: any): string {
  if (typeof data === 'string') {
    return data;
  }
  
  if (data.error || data.message) {
    return data.error || data.message;
  }
  
  // Handle Django REST Framework field validation errors
  if (typeof data === 'object' && data !== null) {
    const errors: string[] = [];
    
    // Check for non_field_errors (general validation errors)
    if (data.non_field_errors && Array.isArray(data.non_field_errors)) {
      errors.push(...data.non_field_errors);
    }
    
    // Check for field-specific errors
    Object.keys(data).forEach(field => {
      if (field !== 'non_field_errors' && Array.isArray(data[field])) {
        const fieldErrors = data[field].map((error: string) => `${field}: ${error}`);
        errors.push(...fieldErrors);
      } else if (field !== 'non_field_errors' && typeof data[field] === 'string') {
        errors.push(`${field}: ${data[field]}`);
      }
    });
    
    if (errors.length > 0) {
      return errors.join('\n');
    }
  }
  
  return 'An error occurred';
}

// Register new user
export async function registerUser(userData: RegisterData): Promise<AuthResponse> {
  const response = await fetch(`${API_URL}/auth/register/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(userData),
  });

  const data = await response.json();
  
  if (!response.ok) {
    console.error('Registration failed with status:', response.status);
    console.error('Response data:', data);
    const errorMessage = parseValidationErrors(data);
    throw new Error(errorMessage);
  }

  return data;
}

// Login user
export async function loginUser(loginData: LoginData): Promise<AuthResponse> {
  const response = await fetch(`${API_URL}/auth/login/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(loginData),
  });

  const data = await response.json();
  
  if (!response.ok) {
    const errorMessage = parseValidationErrors(data) || 'Login failed';
    throw new Error(errorMessage);
  }

  return data;
}

// Logout user
export async function logoutUser(): Promise<{ message: string }> {
  const response = await fetch(`${API_URL}/auth/logout/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Logout failed');
  }

  return data;
}

// Check authentication status
export async function checkAuthStatus(): Promise<AuthStatusResponse> {
  try {
    const response = await fetch(`${API_URL}/auth/status/`, {
      credentials: 'include',
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error checking auth status:', error);
    return { isAuthenticated: false };
  }
}

// Get user profile
export async function getUserProfile(): Promise<{ user: User }> {
  const response = await fetch(`${API_URL}/auth/profile/`, {
    credentials: 'include',
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Failed to get user profile');
  }

  return data;
}