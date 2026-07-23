    /**
     * OpenAPI contract types for the backend.
     *
     * Regenerate from the running ASP.NET Core API with:
     * npm run openapi:types
     */

    export interface paths {
    "/api/research-papers/import-single": {
    post: operations["ResearchPaper_ImportSingle"];
    };
    "/api/dashboard/summary": {
    get: operations["Dashboard_GetSummary"];
    }

    "/api/dashboard/charts/publications-by-year": {
        get: operations["Dashboard_GetPublicationsByYear"];
    }

    "/api/dashboard/charts/publications-by-domain": {
        get: operations["Dashboard_GetPublicationsByDomain"];
    }

    "/api/dashboard/charts/top-journals": {
        get: operations["Dashboard_GetTopJournals"];
    }

    "/api/dashboard/charts/top-keywords": {
        get: operations["Dashboard_GetTopKeywords"];
    }
    "/api/auth/register": {
        post: operations["Auth_Register"];
    };
    "/api/auth/login": {
        post: operations["Auth_Login"];
    };
    "/api/auth/refresh-token": {
        post: operations["Auth_RefreshToken"];
    };
    "/api/auth/logout": {
        post: operations["Auth_Logout"];
    };
    "/api/admin/users": {
        get: operations["Admin_GetUsers"];
    };
    "/api/admin/data-sources": {
        get: operations["Admin_GetDataSources"];
    };
    "/api/trends/topics": {
        get: operations["Trends_GetResearchTopics"];
    };
    "/api/research-papers": {
        get: operations["ResearchPaper_Search"];
    };
    "/api/research-papers/{id}": {
        get: operations["ResearchPaper_GetPaperDetails"];
    };
    "/api/research-topics/{id}": {
        get: operations["ResearchTopics_GetById"];
    };
    "/api/journals": {
        get: operations["Journals_GetJournals"];
    };
    "/api/journals/{id}": {
        get: operations["Journals_GetJournal"];
    };
    "/api/bookmarks": {
        get: operations["Bookmark_GetBookmarks"];
        post: operations["Bookmark_CreateBookmark"];
    };
    "/api/bookmarks/{id}": {
        delete: operations["Bookmark_DeleteBookmark"];
    };
    "/api/reports/summary": {
        get: operations["Report_GetSummary"];
    };
    "/api/reports/generate": {
        post: operations["Report_GenerateReport"];
    };
    "/api/research-papers/import-single": {
        post: operations["ResearchPaper_ImportSingle"];
    };
    }

    export interface operations {
    ResearchPaper_ImportSingle: {
        requestBody: {
        content: {
            "application/json":
            components["schemas"]["ImportResearchPaperByLinkCommand"];
        };
        };
        responses: {
        201: {
            content: {
            "application/json":
                components["schemas"]["ImportSinglePaperResult"];
            };
        };
        };
    };
    Auth_Register: {
        requestBody: {
        content: {
            "application/json": components["schemas"]["RegisterRequest"];
        };
        };
        responses: {
        201: {
            content: {
            "application/json": components["schemas"]["ApiResponseOfRegisterResponse"];
            };
        };
        400: {
            content: {
            "application/json": components["schemas"]["ApiResponseOfRegisterResponse"];
            };
        };
        409: {
            content: {
            "application/json": components["schemas"]["ApiResponseOfRegisterResponse"];
            };
        };
        };
    };
    Auth_Login: {
        requestBody: {
        content: {
            "application/json": components["schemas"]["LoginRequest"];
        };
        };
        responses: {
        200: {
            content: {
            "application/json": components["schemas"]["ApiResponseOfLoginResponse"];
            };
        };
        401: {
            content: {
            "application/json": components["schemas"]["ApiResponseOfLoginResponse"];
            };
        };
        };
    };
    Auth_RefreshToken: {
        requestBody: {
        content: {
            "application/json": components["schemas"]["RefreshTokenRequest"];
        };
        };
        responses: {
        200: {
            content: {
            "application/json": components["schemas"]["ApiResponseOfRefreshTokenResponse"];
            };
        };
        401: {
            content: {
            "application/json": components["schemas"]["ApiResponseOfRefreshTokenResponse"];
            };
        };
        };
    };
    Auth_Logout: {
        responses: {
        200: {
            content: {
            "application/json": components["schemas"]["ApiResponse"];
            };
        };
        401: {
            content: {
            "application/json": components["schemas"]["ApiResponse"];
            };
        };
        };
    };
    Admin_GetUsers: {
        responses: {
        200: {
            content: {
            "application/json": components["schemas"]["ApiResponseOfAdminUserDtoList"];
            };
        };
        };
    };
    Admin_GetDataSources: {
        responses: {
        200: {
            content: {
            "application/json": components["schemas"]["ApiResponseOfAdminApiDataSourceDtoList"];
            };
        };
        };
    };
    Trends_GetResearchTopics: {
        responses: {
        200: {
            content: {
            "application/json": components["schemas"]["ApiResponseOfResearchTopicListItemDtoList"];
            };
        };
        };
    };
    ResearchPaper_Search: {
        parameters: {
        query?: {
            Query?: string;
            TopicName?: string;
            PageNumber?: number;
            PageSize?: number;
            FromYear?: number;
            ToYear?: number;
            ApiSource?: string;
            Domain?: components["schemas"]["ResearchDomain"];
            AuthorName?: string;
            JournalName?: string;
        };
        };
        responses: {
        200: {
            content: {
            "application/json": components["schemas"]["PagedResultOfResearchPaperDto"];
            };
        };
        };
    };
    ResearchPaper_GetPaperDetails: {
        parameters: {
        path: {
            id: string;
        };
        };
        responses: {
        200: {
            content: {
            "application/json": components["schemas"]["ApiResponseOfResearchPaperDto"];
            };
        };
        404: {
            content: {
            "application/json": components["schemas"]["ApiResponseOfResearchPaperDto"];
            };
        };
        };
    };
    ResearchTopics_GetById: {
        parameters: {
        path: {
            id: string;
        };
        };
        responses: {
        200: {
            content: {
            "application/json": components["schemas"]["ResearchTopicDto"];
            };
        };
        };
    };
    Journals_GetJournals: {
        responses: {
        200: {
            content: {
            "application/json": components["schemas"]["ApiResponseOfJournalListItemDtoList"];
            };
        };
        };
    };
    Journals_GetJournal: {
        parameters: {
        path: {
            id: string;
        };
        };
        responses: {
        200: {
            content: {
            "application/json": components["schemas"]["ApiResponseOfJournalListItemDto"];
            };
        };
        404: {
            content: {
            "application/json": components["schemas"]["ApiResponseOfJournalListItemDto"];
            };
        };
        };
    };
    Bookmark_GetBookmarks: {
        parameters: {
        query?: {
            type?: components["schemas"]["BookmarkType"];
        };
        };
        responses: {
        200: {
            content: {
            "application/json": components["schemas"]["ApiResponseOfBookmarkListResponse"];
            };
        };
        };
    };
    Bookmark_CreateBookmark: {
        requestBody: {
        content: {
            "application/json": components["schemas"]["CreateBookmarkRequest"];
        };
        };
        responses: {
        201: {
            content: {
            "application/json": components["schemas"]["ApiResponseOfBookmarkDto"];
            };
        };
        };
    };
    Bookmark_DeleteBookmark: {
        parameters: {
        path: {
            id: string;
        };
        };
        responses: {
        200: {
            content: {
            "application/json": components["schemas"]["ApiResponse"];
            };
        };
        404: {
            content: {
            "application/json": components["schemas"]["ApiResponse"];
            };
        };
        };
    };
    Report_GetSummary: {
        responses: {
        200: {
            content: {
            "application/json": components["schemas"]["ApiResponseOfAnalyticalReportDto"];
            };
        };
        };
    };
    Report_GenerateReport: {
        requestBody: {
        content: {
            "application/json": components["schemas"]["GenerateReportRequest"];
        };
        };
        responses: {
        201: {
            content: {
            "application/json": components["schemas"]["ApiResponseOfAnalyticalReportDto"];
            };
        };
        };
    };
    }

    export interface components {
    schemas: {
        ImportSinglePaperResult: {
        paperId?: string;
        title?: string | null;
        citationCount?: number;
        journalName?: string | null;
        authorNames?: string[] | null;
        linkedTopicNames?: string[] | null;
        };
        ImportResearchPaperByLinkCommand: {
        link: string;
        apiSource: string;
        researchTopicIds: string[];
        };
        ApiResponse: {
        success?: boolean;
        message?: string | null;
        error?: components["schemas"]["ErrorDetails"];
        timestamp?: string;
        traceId?: string | null;
        };
        ApiResponseOfRegisterResponse: components["schemas"]["ApiResponse"] & {
        data?: components["schemas"]["RegisterResponse"] | null;
        };
        ApiResponseOfLoginResponse: components["schemas"]["ApiResponse"] & {
        data?: components["schemas"]["LoginResponse"] | null;
        };
        ApiResponseOfRefreshTokenResponse: components["schemas"]["ApiResponse"] & {
        data?: components["schemas"]["RefreshTokenResponse"] | null;
        };
        ApiResponseOfAdminUserDtoList: components["schemas"]["ApiResponse"] & {
        data?: components["schemas"]["AdminUserDto"][] | null;
        };
        ApiResponseOfAdminApiDataSourceDtoList: components["schemas"]["ApiResponse"] & {
        data?: components["schemas"]["AdminApiDataSourceDto"][] | null;
        };
        ApiResponseOfResearchTopicListItemDtoList: components["schemas"]["ApiResponse"] & {
        data?: components["schemas"]["ResearchTopicListItemDto"][] | null;
        };
        ApiResponseOfJournalListItemDtoList: components["schemas"]["ApiResponse"] & {
        data?: components["schemas"]["JournalListItemDto"][] | null;
        };
        ApiResponseOfJournalListItemDto: components["schemas"]["ApiResponse"] & {
        data?: components["schemas"]["JournalListItemDto"] | null;
        };
        ApiResponseOfResearchPaperDto: components["schemas"]["ApiResponse"] & {
        data?: components["schemas"]["ResearchPaperDto"] | null;
        };
        ApiResponseOfBookmarkDto: components["schemas"]["ApiResponse"] & {
        data?: components["schemas"]["BookmarkDto"] | null;
        };
        ApiResponseOfBookmarkListResponse: components["schemas"]["ApiResponse"] & {
        data?: components["schemas"]["BookmarkListResponse"] | null;
        };
        ApiResponseOfAnalyticalReportDto: components["schemas"]["ApiResponse"] & {
        data?: components["schemas"]["AnalyticalReportDto"] | null;
        };
        ErrorDetails: {
        statusCode?: number;
        message?: string | null;
        validationErrors?: Record<string, string[]>;
        exceptionType?: string | null;
        };
        RegisterRequest: {
        email?: string | null;
        fullName?: string | null;
        password?: string | null;
        role?: components["schemas"]["UserRole"];
        };
        RegisterResponse: {
        userId?: string;
        email?: string | null;
        fullName?: string | null;
        message?: string | null;
        };
        LoginRequest: {
        email?: string | null;
        password?: string | null;
        };
        LoginResponse: {
        userId?: string;
        email?: string | null;
        fullName?: string | null;
        accessToken?: string | null;
        refreshToken?: string | null;
        accessTokenExpirationMinutes?: number;
        };
        RefreshTokenRequest: {
        refreshToken?: string | null;
        };
        RefreshTokenResponse: {
        accessToken?: string | null;
        refreshToken?: string | null;
        accessTokenExpirationMinutes?: number;
        };
        AdminUserDto: {
        id?: string;
        fullName?: string | null;
        email?: string | null;
        role?: string | null;
        status?: string | null;
        isEmailVerified?: boolean;
        createdAt?: string;
        updatedAt?: string;
        };
        AdminApiDataSourceDto: {
        id?: string;
        sourceType?: string | null;
        name?: string | null;
        baseUrl?: string | null;
        status?: string | null;
        lastSyncTime?: string;
        requestsPerMinute?: number;
        createdAt?: string;
        updatedAt?: string;
        };
        ResearchTopicListItemDto: {
        id?: string;
        name?: string | null;
        description?: string | null;
        domain?: string | null;
        papersCount?: number;
        };
        ResearchTopicDto: {
        id?: string;
        name?: string | null;
        description?: string | null;
        domain?: components["schemas"]["ResearchDomain"];
        papersCount?: number;
        createdAt?: string;
        updatedAt?: string;
        };
        ResearchPaperDto: {
        id?: string;
        title?: string | null;
        abstract?: string | null;
        keywords?: string[] | null;
        publicationYear?: number;
        doi?: string | null;
        url?: string | null;
        citationCount?: number;
        apiSource?: string | null;
        domain?: components["schemas"]["ResearchDomain"];
        journal?: components["schemas"]["ResearchPaperJournalDto"] | null;
        authors?: components["schemas"]["AuthorDto"][] | null;
        topics?: string[] | null;
        };
        ResearchPaperJournalDto: {
        id?: string;
        title?: string | null;
        issn?: string | null;
        publisher?: string | null;
        };
        AuthorDto: {
        id?: string;
        fullName?: string | null;
        orcid?: string | null;
        };
        PagedResultOfResearchPaperDto: {
        items?: components["schemas"]["ResearchPaperDto"][] | null;
        totalCount?: number;
        pageNumber?: number;
        pageSize?: number;
        totalPages?: number;
        hasPrevPage?: boolean;
        hasNextPage?: boolean;
        };
        JournalListItemDto: {
        id?: string;
        title?: string | null;
        issn?: string | null;
        publisher?: string | null;
        establishedYear?: number;
        country?: string | null;
        website?: string | null;
        papersCount?: number;
        createdAt?: string;
        updatedAt?: string;
        };
        BookmarkDto: {
        id?: string;
        type?: components["schemas"]["BookmarkType"];
        researchPaperId?: string | null;
        paperTitle?: string | null;
        keywordId?: string | null;
        keywordName?: string | null;
        journalId?: string | null;
        journalTitle?: string | null;
        researchTopicId?: string | null;
        researchTopicName?: string | null;
        notes?: string | null;
        createdAt?: string;
        };
        CreateBookmarkRequest: {
        type?: components["schemas"]["BookmarkType"];
        researchPaperId?: string | null;
        keywordId?: string | null;
        keywordName?: string | null;
        journalId?: string | null;
        researchTopicId?: string | null;
        notes?: string | null;
        };
        BookmarkListResponse: {
        items?: components["schemas"]["BookmarkDto"][] | null;
        totalCount?: number;
        };
        AnalyticalReportDto: {
        id?: string;
        title?: string | null;
        description?: string | null;
        totalPapersCount?: number;
        activeUsersCount?: number;
        totalBookmarksCount?: number;
        topResearchDomains?: components["schemas"]["DomainStatDto"][] | null;
        mostCitedPapers?: components["schemas"]["CitedPaperDto"][] | null;
        publicationsByYear?: components["schemas"]["YearlyPublicationDto"][] | null;
        topKeywords?: components["schemas"]["KeywordStatDto"][] | null;
        generatedAt?: string;
        };
        GenerateReportRequest: {
        title?: string | null;
        };
        DomainStatDto: {
        domain?: string | null;
        paperCount?: number;
        };
        YearlyPublicationDto: {
        year?: number;
        count?: number;
        };
        KeywordStatDto: {
        name?: string | null;
        frequency?: number;
        };
        CitedPaperDto: {
        id?: string;
        title?: string | null;
        citationCount?: number;
        publicationYear?: number;
        };
        UserRole: 0 | 1 | 2 | "Admin" | "User" | "Researcher";
        ResearchDomain: 0 | 1 | "ComputerScience" | "ArtificialIntelligence";
        BookmarkType: 0 | 1 | 2 | 3 | "Paper" | "Keyword" | "Journal" | "Topic";
    };
    }
