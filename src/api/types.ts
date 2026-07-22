export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  error?: { statusCode: number; message: string; validationErrors?: string[] };
  timestamp: string;
  traceId?: string;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage?: boolean;
  hasPrevPage?: boolean;
  hasNextPage: boolean;
}

export interface DashboardSummary {
  totalPapers: number;
  papersThisYear: number;
  totalJournals: number;
  totalAuthors: number;
  averageCitations: number;
  topDomain: string;
  totalResearchTopics: number;
}

export interface ChartResponse {
  chartType: string;
  title: string;
  labels: string[];
  values: number[];
  dataPoints: Array<{ label: string; value: number }>;
}

export interface Author {
  id: string;
  fullName: string;
  orcid?: string;
}
export interface JournalSummary {
  id: string;
  title: string;
  issn?: string;
  publisher?: string;
}
export interface ResearchPaper {
  id: string;
  title: string;
  abstract?: string;
  keywords: string[];
  publicationYear: number;
  doi?: string;
  url?: string;
  citationCount: number;
  apiSource: string;
  domain: number | string;
  journal?: JournalSummary;
  authors: Author[];
  topics: string[];
}

export interface ResearchTopic {
  id: string;
  name: string;
  description: string;
  domain: number | string;
  papersCount: number;
}

export interface JournalListItem {
  id: string;
  title: string;
  issn?: string;
  publisher?: string;
  totalPapersPublished: number;
}

export interface TrendPoint {
  year: number;
  publicationCount: number;
  averageCitations: number;
  growthRate: number;
}
export interface TopicTrend {
  topicId: string;
  topicName: string;
  fromYear: number;
  toYear: number;
  dataPoints: TrendPoint[];
  totalPublications: number;
  overallGrowthRate: number;
}

export interface TrendingTopic {
  rank: number;
  name: string;
  type: string;
  recentCount: number;
  previousCount: number;
  growthRate: number;
  totalPapers: number;
}

export interface BookmarkItem {
  id: string;
  type: number | string;
  researchPaperId?: string;
  paperTitle?: string;
  keywordName?: string;
  journalId?: string;
  journalTitle?: string;
  researchTopicId?: string;
  researchTopicName?: string;
  notes?: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  relatedPaperId?: string;
  relatedJournalId?: string;
  relatedResearchTopicId?: string;
  isRead: boolean;
  createdAt: string;
}

export type FollowTargetType = "Journal" | "ResearchTopic";

export interface FollowSubscription {
  id: string;
  targetType: FollowTargetType;
  targetId: string;
  targetName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const domainLabel = (domain: number | string) => {
  if (domain === 0 || domain === "ComputerScience") return "Computer Science";
  if (domain === 1 || domain === "ArtificialIntelligence") return "Artificial Intelligence";
  return String(domain);
};
