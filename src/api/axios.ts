import axios, {
    AxiosError,
    AxiosInstance,
    InternalAxiosRequestConfig
} from "axios";
import { API_BASE_URL } from "@/shared/config/env";
import { getAccessToken, clearAuthTokens } from "@/shared/auth/token-storage";

const api = axios.create({
    baseURL: `${API_BASE_URL}/api`,
    headers: {
        "Content-Type": "application/json",
    },
});

// Automatically attach JWT token to every request
api.interceptors.request.use(
    (config) => {

        const token = getAccessToken();

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// Optional: handle unauthorized responses
api.interceptors.response.use(
    (response) => response,
    (error) => {

        if (error.response?.status === 401) {
            clearAuthTokens();
            window.location.href = "/auth";
        }

        return Promise.reject(error);
    }
);

export default api;
