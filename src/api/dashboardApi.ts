import api from "./axios";

export const getDashboard = async () => {
    const response = await api.get("/dashboard");
    return response.data;
};

export const getPublicationsByYear = async () => {
    const response = await api.get("/dashboard/publications-by-year");
    return response.data;
};

export const getTopDomains = async () => {
    const response = await api.get("/dashboard/top-domains");
    return response.data;
};

export const getTopJournals = async () => {
    const response = await api.get("/dashboard/top-journals");
    return response.data;
};

export const getSummary = async () => {
    const response = await api.get("/dashboard/summary");
    return response.data;
};