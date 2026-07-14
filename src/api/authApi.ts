import api from "./axios";

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    fullName: string;
    password: string;
}

export const login = async (request: LoginRequest) => {
    const response = await api.post("/auth/login", request);
    return response.data;
};

export const register = async (request: RegisterRequest) => {
    const response = await api.post("/auth/register", request);
    return response.data;
};

export const refreshToken = async (refreshToken: string) => {
    const response = await api.post("/auth/refresh-token", {
        refreshToken,
    });

    return response.data;
};

export const logout = async () => {
    const response = await api.post("/auth/logout");
    return response.data;
};