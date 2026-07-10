const TOKEN_KEY = 'ucab_token';
const USER_KEY = 'ucab_user';

export const getToken = () => sessionStorage.getItem(TOKEN_KEY);

export const setToken = (token) => {
  if (token) sessionStorage.setItem(TOKEN_KEY, token);
  else sessionStorage.removeItem(TOKEN_KEY);
};

export const getStoredUser = () => {
  const raw = sessionStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const setStoredUser = (user) => {
  if (user) sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  else sessionStorage.removeItem(USER_KEY);
};

export const clearAuth = () => {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
};
