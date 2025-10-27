import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  type ReactNode,
} from "react";
import {
  checkAuthStatus,
  loginUser,
  registerUser,
  logoutUser,
} from "../data/auth";
import type { User, LoginData, RegisterData } from "../data/auth";

// ====== Types ======
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

type AuthAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_USER"; payload: User }
  | { type: "CLEAR_USER" }
  | { type: "SET_ERROR"; payload: string }
  | { type: "CLEAR_ERROR" };

interface AuthContextType extends AuthState {
  login: (loginData: LoginData) => Promise<void>;
  register: (registerData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

// ====== Initial State ======
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// ====== Reducer ======
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_USER":
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case "CLEAR_USER":
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case "SET_ERROR":
      return { ...state, error: action.payload, isLoading: false };
    case "CLEAR_ERROR":
      return { ...state, error: null };
    default:
      return state;
  }
}

// ====== Context ======
const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// ====== Provider ======
export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load session on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        dispatch({ type: "SET_LOADING", payload: true });
        const authStatus = await checkAuthStatus();

        if (authStatus.isAuthenticated && authStatus.user) {
          dispatch({ type: "SET_USER", payload: authStatus.user });
          localStorage.setItem("user", JSON.stringify(authStatus.user));
        } else {
          dispatch({ type: "CLEAR_USER" });
          localStorage.removeItem("user");
        }
      } catch (error) {
        console.error("Failed to check auth status:", error);
        dispatch({ type: "CLEAR_USER" });
      }
    };

    initializeAuth();
  }, []);

  // Login
  const login = async (loginData: LoginData) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      dispatch({ type: "CLEAR_ERROR" });
      const response = await loginUser(loginData);
      dispatch({ type: "SET_USER", payload: response.user });
      localStorage.setItem("user", JSON.stringify(response.user));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Login failed. Try again.";
      dispatch({ type: "SET_ERROR", payload: message });
      throw error;
    }
  };

  // Register
  const register = async (registerData: RegisterData) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      dispatch({ type: "CLEAR_ERROR" });
      const response = await registerUser(registerData);
      dispatch({ type: "SET_USER", payload: response.user });
      localStorage.setItem("user", JSON.stringify(response.user));
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Registration failed. Please try again.";
      dispatch({ type: "SET_ERROR", payload: message });
      throw error;
    }
  };

  // Logout
  const logout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      localStorage.removeItem("user");
      dispatch({ type: "CLEAR_USER" });
    }
  };

  const clearError = () => dispatch({ type: "CLEAR_ERROR" });

  const contextValue: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    clearError,
  };

  // Do NOT export anything else from this file → keeps react-refresh happy
  return (
    <AuthContext.Provider value={contextValue}>
      {state.isLoading ? (
        <div className="flex items-center justify-center h-screen text-gray-600">
          Loading...
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

// ====== Hook ======
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}