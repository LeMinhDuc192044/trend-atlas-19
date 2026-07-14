import api from "./axios";

export const getKeywordTrend = async (
    keyword: string,
    fromYear?: number,
    toYear?: number
) => {

    const response = await api.get("/trends/keyword", {
        params: {
            keyword,
            fromYear,
            toYear
        }
    });

    return response.data;
};

export const getResearchTopicTrend = async (topicId: string) => {

    const response = await api.get(`/trends/topic/${topicId}`);

    return response.data;
};

export const getTrendingTopics = async () => {

    const response = await api.get("/trends/trending-topics");

    return response.data;
};