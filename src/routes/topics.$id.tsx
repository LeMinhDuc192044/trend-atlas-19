import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowLeft, TrendingUp } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { paperService, topicService } from "@/api/services";
import { domainLabel } from "@/api/types";
import { FollowButton } from "@/components/follow-button";

export const Route = createFileRoute("/topics/$id")({ component: TopicDetail });

function TopicDetail() {
  const { id } = Route.useParams();
  const topic = useQuery({
    queryKey: ["topic", id],
    queryFn: () => topicService.detail(id),
    retry: false,
  });
  const trend = useQuery({
    queryKey: ["topic", id, "trend"],
    queryFn: () => topicService.trend(id),
    retry: false,
  });
  const papers = useQuery({
    queryKey: ["topic", id, "papers"],
    queryFn: () => paperService.list({ topicName: topic.data?.name, pageSize: 5 }),
    enabled: Boolean(topic.data?.name),
  });
  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-5 md:p-8">
        <Button asChild variant="ghost" className="w-fit">
          <Link to="/topics">
            <ArrowLeft data-icon="inline-start" /> Trend explorer
          </Link>
        </Button>
        {topic.isLoading ? (
          <Skeleton className="h-40" />
        ) : topic.error ? (
          <Alert variant="destructive">
            <AlertTitle>Topic unavailable</AlertTitle>
            <AlertDescription>
              {topic.error.message}. Topic details require authentication.
            </AlertDescription>
          </Alert>
        ) : topic.data ? (
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                {domainLabel(topic.data.domain)}
              </p>
              <h1 className="mt-2 font-serif text-4xl">{topic.data.name}</h1>
              <p className="mt-2 max-w-2xl italic text-muted-foreground">
                {topic.data.description}
              </p>
            </div>
            {trend.data ? (
              <div className="text-right">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  Overall growth
                </p>
                <p className="mt-1 flex items-center gap-1 font-serif text-3xl text-trend-up">
                  <TrendingUp /> {trend.data.overallGrowthRate >= 0 ? "+" : ""}
                  {trend.data.overallGrowthRate.toFixed(1)}%
                </p>
              </div>
            ) : null}
            <FollowButton targetType="ResearchTopic" targetId={topic.data.id} />
          </div>
        ) : null}
        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-xl">Publication momentum</CardTitle>
          </CardHeader>
          <CardContent>
            {trend.isLoading ? (
              <Skeleton className="h-72" />
            ) : trend.error ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                Trend data is not available.
              </p>
            ) : trend.data?.dataPoints.length ? (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trend.data.dataPoints}>
                    <defs>
                      <linearGradient id="topic-fill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--indigo)" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="var(--indigo)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      dataKey="publicationCount"
                      stroke="var(--indigo)"
                      fill="url(#topic-fill)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="py-10 text-center text-sm text-muted-foreground">No trend data yet.</p>
            )}
          </CardContent>
        </Card>
        <section>
          <h2 className="mb-4 font-serif text-2xl">Related papers</h2>
          <div className="flex flex-col gap-3">
            {papers.isLoading ? (
              <Skeleton className="h-32" />
            ) : papers.data?.items.length ? (
              papers.data.items.map((paper) => (
                <Link key={paper.id} to="/papers/$id" params={{ id: paper.id }}>
                  <Card className="p-5 shadow-sm hover:shadow-md">
                    <h3 className="font-semibold hover:text-brand">{paper.title}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {paper.authors.map((author) => author.fullName).join(", ")} ·{" "}
                      {paper.publicationYear}
                    </p>
                  </Card>
                </Link>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No related papers found.</p>
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
