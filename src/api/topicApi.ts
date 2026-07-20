import api from "./axios";

export const getTopics = async () => {

    const response = await api.get("/research-topics");

    return response.data;
};

export const getTopic = async (id: string) => {

    const response = await api.get(`/research-topics/${id}`);

    return response.data;
};

export const createTopic = async (topic: any) => {

    const response = await api.post(
        "/research-topics",
        topic
    );

    return response.data;
};

export const updateTopic = async (
    id: string,
    topic: any
) => {

    const response = await api.put(
        `/research-topics/${id}`,
        topic
    );

    return response.data;
};

export const deleteTopic = async (id: string) => {

    const response = await api.delete(
        `/research-topics/${id}`
    );

    return response.data;
};