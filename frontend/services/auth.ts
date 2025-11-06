import api from "./Api";

export const register = async (username: string, email: string, password: string, curso: string) => {
  const response = await api.post("register/", { username, email, password, curso });
  return response.data;
};

export const login = async (email: string, password: string) => {
  const response = await api.post("token/", { email, password });
  return response.data;
};

export const refreshToken = async (refresh: string) => {
  const response = await api.post("token/refresh/", { refresh });
  return response.data;
};
