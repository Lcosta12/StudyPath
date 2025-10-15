import api from "./Api";

// Registro de usuário
export const register = async (username: string, email: string, password: string, curso: string) => {
  const response = await api.post("register/", { username, email, password, curso });
  return response.data;
};

// Login (gera token)
export const login = async (email: string, password: string) => {
  const response = await api.post("token/", { email, password });
  return response.data;
};

// Refresh token
export const refreshToken = async (refresh: string) => {
  const response = await api.post("token/refresh/", { refresh });
  return response.data;
};
