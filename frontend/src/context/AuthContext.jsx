import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);

/**
 * Provider component to manage authentication state.
 * @param {Object} props - Component properties.
 * @param {React.ReactNode} props.children - Child components.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * Load authentication state from local storage on component mount.
   */
  useEffect(() => {
    const storedToken = window.localStorage.getItem('authToken');
    const storedUser = window.localStorage.getItem('authUser');

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        window.localStorage.removeItem('authToken');
        window.localStorage.removeItem('authUser');
      }
    }

    setLoading(false);
  }, []);

  /**
   * Log in a user by setting the user data and token.
   * @param {Object} userData - The user data.
   * @param {string} jwt - The JWT token.
   */
  const login = (userData, jwt) => {
    setUser(userData);
    setToken(jwt);
    window.localStorage.setItem('authToken', jwt);
    window.localStorage.setItem('authUser', JSON.stringify(userData));
  };

  /**
   * Log out the current user by clearing the user data and token.
   */
  const logout = () => {
    setUser(null);
    setToken(null);
    window.localStorage.removeItem('authToken');
    window.localStorage.removeItem('authUser');
  };

  const value = { user, token, loading, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Custom hook to access authentication context.
 * @returns {Object} Authentication context value.
 */
export function useAuth() {
  return useContext(AuthContext);
}