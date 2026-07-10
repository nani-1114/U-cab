import { createContext, useState, useEffect, useCallback } from 'react';
import { getToken, setToken, getStoredUser, setStoredUser, clearAuth } from '../utils/storage';
import { loginUser, loginDriver, loginAdmin } from '../services/authService';
import { getProfile } from '../services/userService';
import { getDriverProfile } from '../services/driverService';
import { ROLES } from '../utils/constants';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getStoredUser);
  const [loading, setLoading] = useState(true);

  const persistAuth = useCallback((authData) => {
    const { token, ...userData } = authData;
    setToken(token);
    setStoredUser(userData);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    clearAuth();
    setUser(null);
  }, []);

  const login = async (email, password, role = ROLES.USER) => {
    let response;
    if (role === ROLES.DRIVER) response = await loginDriver({ email, password });
    else if (role === ROLES.ADMIN) response = await loginAdmin({ email, password });
    else response = await loginUser({ email, password });
    persistAuth(response.data);
    return response;
  };

  const register = (authData) => persistAuth(authData);

  const refreshProfile = useCallback(async () => {
    if (!getToken()) {
      setLoading(false);
      return;
    }
    try {
      const stored = getStoredUser();
      if (!stored) {
        logout();
        return;
      }
      if (stored.role === ROLES.DRIVER) {
        const res = await getDriverProfile();
        const updated = { ...stored, ...res.data };
        setStoredUser(updated);
        setUser(updated);
      } else if (stored.role === ROLES.USER) {
        const res = await getProfile();
        const updated = { ...stored, ...res.data };
        setStoredUser(updated);
        setUser(updated);
      }
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user && !!getToken(),
        loading,
        login,
        register,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
