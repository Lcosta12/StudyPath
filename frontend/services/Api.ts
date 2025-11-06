import axios from "axios";

// Use Vite environment variable when deployed (must start with VITE_ to be exposed)
const baseURL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000/api/";

const api = axios.create({ baseURL });

export default api;
