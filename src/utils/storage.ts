const ACCESS_TOKEN = "access_token";
const REFRESH_TOKEN = "refresh_token";
const USER = "user";

export const storage = {
  getAccessToken: () => localStorage.getItem(ACCESS_TOKEN),
  setAccessToken: (token: string) => localStorage.setItem(ACCESS_TOKEN, token),
  getRefreshToken: () => localStorage.getItem(REFRESH_TOKEN),
  setRefreshToken: (token: string) => localStorage.setItem(REFRESH_TOKEN, token),
  getUser: <T = unknown>(): T | null => {
    const raw = localStorage.getItem(USER);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },
  setUser: (user: unknown) => localStorage.setItem(USER, JSON.stringify(user)),
  clearTokens: () => {
    localStorage.removeItem(ACCESS_TOKEN);
    localStorage.removeItem(REFRESH_TOKEN);
    localStorage.removeItem(USER);
  },
};
