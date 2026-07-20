import axios, {
    AxiosError,
    AxiosInstance,
    InternalAxiosRequestConfig
} from "axios";

const api = axios.create({
    baseURL: "https://localhost:5220/api",
    headers: {
        "Content-Type": "application/json",
    },
});

// Automatically attach JWT token to every request
api.interceptors.request.use(
    (config) => {

        const token = localStorage.getItem("token");

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
            localStorage.removeItem("token");
            window.location.href = "/login";
        }

        return Promise.reject(error);
    }
);

export default api;