import api from "./axios";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AuthorDto {
  id: string;
  fullName: string;
  orcid: string | null;
}

export interface JournalDto {
  id: string;
  title: string;
  issn: string | null;
  publisher: string | null;
}

export interface ResearchPaperDto {
  id: string;
  title: string;
  abstract: string | null;
  keywords: string[];
  publicationYear: number;
  doi: string | null;
  url: string | null;
  citationCount: number;
  apiSource: string;
  domain: string;
  journal: JournalDto | null;
  authors: AuthorDto[];
  topics: string[];
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
}

export interface GetAllPapersRequest {
  pageNumber?: number;
  pageSize?: number;
}

export interface SearchPapersRequest {
  query?: string;
  topicName?: string;
  pageNumber?: number;
  pageSize?: number;
  fromYear?: number;
  toYear?: number;
  apiSource?: string;
  domain?: string;
  authorName?: string;
  journalName?: string;
}

export interface ImportPapersRequest {
  query: string;
  apiSource: string;
  limit?: number;
}

export interface ImportSinglePaperRequest {
  link: string;
  apiSource: string;
  researchTopicIds: string[];
}

// ── API calls ─────────────────────────────────────────────────────────────────

export const getAllPapers = async (
  params: GetAllPapersRequest = {}
): Promise<PagedResult<ResearchPaperDto>> => {
  const response = await api.get("/research-papers/all", { params });
  return response.data;
};

export const searchPapers = async (
  params: SearchPapersRequest
): Promise<PagedResult<ResearchPaperDto>> => {
  const response = await api.get("/research-papers", { params });
  return response.data;
};

export const getPaperById = async (id: string): Promise<ResearchPaperDto> => {
  const response = await api.get(`/research-papers/${id}`);
  return response.data;
};

export const importPapers = async (request: ImportPapersRequest) => {
  const response = await api.post("/research-papers/import", request);
  return response.data;
};

export const importSinglePaper = async (request: ImportSinglePaperRequest) => {
  const response = await api.post("/research-papers/import-single", request);
  return response.data;
};