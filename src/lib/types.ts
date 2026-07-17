export interface BookmarkDto {
  id: string;
  userId: string;
  type: BookmarkType;
  researchPaperId?: string;
  keywordId?: string;
  journalId?: string;
  researchTopicId?: string;
  notes?: string;
  createdAt: string;
  // Included navigation properties from backend response
  researchPaper?: {
    id: string;
    title: string;
    abstract: string;
    doi: string;
    year: number;
    journalName: string;
    authors: string[];
  };
}

export enum BookmarkType {
  Paper = 0,
  Journal = 1,
  ResearchTopic = 2,
  Keyword = 3,
}

export interface BookmarkListResponse {
  items: BookmarkDto[];
  totalCount: number;
}

export interface DomainStatDto {
  domain: string;
  paperCount: number;
}

export interface YearlyPublicationDto {
  year: number;
  count: number;
}

export interface KeywordStatDto {
  name: string;
  frequency: number;
}

export interface CitedPaperDto {
  id: string;
  title: string;
  citationCount: number;
  publicationYear: number;
}

export interface AnalyticalReportDto {
  id: string;
  title: string;
  description: string;
  totalPapersCount: number;
  activeUsersCount: number;
  totalBookmarksCount: number;
  topResearchDomains: DomainStatDto[];
  mostCitedPapers: CitedPaperDto[];
  publicationsByYear: YearlyPublicationDto[];
  topKeywords: KeywordStatDto[];
  generatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  statusCode: number;
}
