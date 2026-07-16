import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  fetchCurrentUser,
  loginUser,
  registerUser,
} from "../services/authService";

const AuthContext = createContext(null);

const TOKEN_KEY = "campusconnect_token";
const USER_KEY = "campusconnect_user";

const readStoredUser = () => {
  try {
    const value = localStorage.getItem(USER_KEY);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);
  const [token, setToken] = useState(() =>
    localStorage.getItem(TOKEN_KEY),
  );
  const [initializing, setInitializing] = useState(true);

  const persistAuthentication = useCallback((authData) => {
    localStorage.setItem(TOKEN_KEY, authData.accessToken);
    localStorage.setItem(USER_KEY, JSON.stringify(authData.user));

    setToken(authData.accessToken);
    setUser(authData.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);

    setToken(null);
    setUser(null);
  }, []);

  const login = useCallback(
    async (credentials) => {
      const authData = await loginUser(credentials);
      persistAuthentication(authData);
      return authData.user;
    },
    [persistAuthentication],
  );

  const register = useCallback(
    async (formData) => {
      const authData = await registerUser(formData);
      persistAuthentication(authData);
      return authData.user;
    },
    [persistAuthentication],
  );

  useEffect(() => {
    const restoreSession = async () => {
      const storedToken = localStorage.getItem(TOKEN_KEY);

      if (!storedToken) {
        setInitializing(false);
        return;
      }

      try {
        const currentUser = await fetchCurrentUser();

        localStorage.setItem(
          USER_KEY,
          JSON.stringify(currentUser),
        );

        setToken(storedToken);
        setUser(currentUser);
      } catch {
        logout();
      } finally {
        setInitializing(false);
      }
    };

    restoreSession();
  }, [logout]);

  const value = useMemo(
    () => ({
      user,
      token,
      initializing,
      isAuthenticated: Boolean(token && user),
      login,
      register,
      logout,
    }),
    [
      user,
      token,
      initializing,
      login,
      register,
      logout,
    ],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider",
    );
  }

  return context;
}