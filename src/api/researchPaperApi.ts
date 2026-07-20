import api from "./axios";

export interface SearchPapersRequest {
    keyword?: string;
    author?: string;
    journal?: string;
    fromYear?: number;
    toYear?: number;
    pageNumber: number;
    pageSize: number;
    sortBy?: string;
    sortDescending?: boolean;
}