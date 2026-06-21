export const useAuth = () => {
  const token = localStorage.getItem("accessToken");

  const login = (accessToken: string) => {
    localStorage.setItem("accessToken", accessToken);
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    window.location.href = "/login";
  };

  return { isAuthenticated: !!token, login, logout };
};
