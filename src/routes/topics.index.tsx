import { createFileRoute, Link } from "@tanstack/react-router";
import { useDeferredValue, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, Search } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { topicService } from "@/api/services";
import { domainLabel } from "@/api/types";

export const Route = createFileRoute("/topics/")({ component: TopicsList });

function TopicsList() {
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const topics = useQuery({
    queryKey: ["topics", deferredSearch],
    queryFn: () => topicService.list(deferredSearch),
  });
  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-5 md:p-8">
        <div>
          <h1 className="font-serif text-4xl">Trend Explorer</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Browse research topics indexed by the publication tracker.
          </p>
        </div>
        <div className="relative max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search research topics…"
            className="pl-9"
          />
        </div>
        {topics.error ? (
          <Alert variant="destructive">
            <AlertTitle>Could not load topics</AlertTitle>
            <AlertDescription>{topics.error.message}</AlertDescription>
          </Alert>
        ) : null}
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {topics.isLoading ? (
            Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-52 rounded-xl" />)
          ) : topics.data?.items.length ? (
            topics.data.items.map((topic) => (
              <Link key={topic.id} to="/topics/$id" params={{ id: topic.id }}>
                <Card className="h-full shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
                  <CardHeader>
                    <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      <span>{domainLabel(topic.domain)}</span>
                      <ArrowUpRight />
                    </div>
                    <CardTitle className="font-serif text-xl">{topic.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="line-clamp-3 text-sm italic text-muted-foreground">
                      {topic.description || "No description available."}
                    </p>
                    <p className="mt-5 font-mono text-xs text-muted-foreground">
                      {topic.papersCount.toLocaleString()} papers indexed
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))
          ) : (
            <div className="col-span-full py-16 text-center text-sm text-muted-foreground">
              No topics match your search.
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
