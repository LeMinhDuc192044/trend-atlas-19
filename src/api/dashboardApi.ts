import { apiClient, unwrapApiResponse } from "@/shared/api/client";
import api from "./axios";


export const getDashboard = async () => {
    const response = await api.get("/dashboard");
    return response.data;
};

export async function getPublicationsByYear({ range }: { range: string }) {
    const { data, error } = await apiClient.GET(
        "/api/dashboard/charts/publications-by-year",
        { params: { query: { range } } }
    );

    if (error) throw error;

    return unwrapApiResponse(data);
}

export async function getTopDomains() {
    const { data, error } =
        await apiClient.GET("/api/dashboard/charts/publications-by-domain");

    if (error) throw error;

    return unwrapApiResponse(data);
}

export async function getTopJournals() {
    const { data, error } =
        await apiClient.GET("/api/dashboard/charts/top-journals");

    if (error) throw error;

    return unwrapApiResponse(data);
}

export async function getSummary() {
    const { data, error } = await apiClient.GET("/api/dashboard/summary");

    if (error) throw error;

    return unwrapApiResponse(data);
}

export async function getTopKeywords() {
    const { data, error } =
        await apiClient.GET("/api/dashboard/charts/top-keywords");

    if (error) throw error;

    return unwrapApiResponse(data);
}