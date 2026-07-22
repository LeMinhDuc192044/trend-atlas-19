import { topics, journals, papers, publicationTrend, topicTrend } from "./mock-data";

export async function handleMockApi(path: string): Promise<unknown | null> {
  const matchPath = path.split('?')[0];
  const searchParams = new URLSearchParams(path.split('?')[1] || '');

  const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
  await delay(300); // Simulate network delay

  const ok = (data: any) => ({ isSuccess: true, data, message: "Mock success" });

  if (matchPath === "/api/dashboard/summary") {
    return ok({
      totalPublications: papers.length * 100,
      totalJournals: journals.length,
      totalKeywords: 120,
      totalTopics: topics.length,
      publicationGrowthPercentage: 12.5
    });
  }

  if (matchPath === "/api/dashboard/charts/publications-by-year") {
    return ok({
      labels: ["2020", "2021", "2022", "2023", "2024"],
      datasets: [{ label: "Publications", data: [120, 150, 180, 220, 310] }]
    });
  }

  if (matchPath === "/api/dashboard/charts/top-keywords") {
    return ok({
      labels: ["AI", "Machine Learning", "Quantum", "CRISPR", "Blockchain"],
      datasets: [{ label: "Count", data: [50, 40, 30, 20, 10] }]
    });
  }

  if (matchPath === "/api/dashboard/charts/publications-by-domain") {
    return ok({
      labels: ["Computer Science", "Physics", "Chemistry", "Biology"],
      datasets: [{ label: "Count", data: [150, 90, 80, 120] }]
    });
  }

  if (matchPath === "/api/dashboard/charts/top-journals") {
    return ok({
      labels: journals.slice(0, 5).map(j => j.name),
      datasets: [{ label: "Count", data: journals.slice(0, 5).map(j => j.papersCount) }]
    });
  }

  if (matchPath === "/api/trends/keywords") {
    return ok({
      keyword: searchParams.get('keyword') || 'Unknown',
      trendData: publicationTrend.map(t => ({ label: t.month, value: t.cs }))
    });
  }

  if (matchPath === "/api/trends/topics") {
    return ok(topics.map(t => ({ id: t.id, name: t.name, papersCount: t.papersCount })));
  }

  if (matchPath.startsWith("/api/trends/topics/") && matchPath !== "/api/trends/topics") {
    const topicId = matchPath.split('/').pop();
    const topic = topics.find(t => t.id === topicId);
    return ok({
      topicId: topic?.id,
      topicName: topic?.name,
      trendData: topicTrend(20).map(t => ({ label: t.month, value: t.value }))
    });
  }

  if (matchPath === "/api/trends/trending-topics") {
    return ok({
      items: topics.slice(0, 5).map(t => ({
        id: t.id,
        name: t.name,
        growthPercentage: t.growth,
        currentCount: t.papersCount
      }))
    });
  }

  if (matchPath === "/api/auth/login") {
    // Create a simple mock JWT
    const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const payload = btoa(JSON.stringify({
      sub: "mock-id-123",
      email: "user@example.com",
      name: "Mock User",
      role: 1 // User
    }));
    return { token: `${header}.${payload}.signature` };
  }

  if (matchPath === "/api/auth/register") {
    return { success: true };
  }

  return null; // Return null if not mocked
}
