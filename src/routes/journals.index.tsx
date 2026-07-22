import { createFileRoute, Link } from "@tanstack/react-router";
import { useDeferredValue, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { journalService } from "@/api/services";

export const Route = createFileRoute("/journals/")({ component: JournalsList });

function JournalsList() {
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const journals = useQuery({
    queryKey: ["journals", deferredSearch],
    queryFn: () => journalService.list(deferredSearch),
  });
  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-5 md:p-8">
        <div>
          <h1 className="font-serif text-4xl">Journal Tracker</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Browse journals and their indexed publication activity.
          </p>
        </div>
        <div className="relative max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search journal or publisher…"
            className="pl-9"
          />
        </div>
        {journals.error ? (
          <Alert variant="destructive">
            <AlertTitle>Could not load journals</AlertTitle>
            <AlertDescription>{journals.error.message}</AlertDescription>
          </Alert>
        ) : null}
        {journals.isLoading ? (
          <Skeleton className="h-96 rounded-xl" />
        ) : (
          <div className="overflow-hidden rounded-xl border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Journal</TableHead>
                  <TableHead>Publisher</TableHead>
                  <TableHead>ISSN</TableHead>
                  <TableHead className="text-right">Papers</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {journals.data?.items.length ? (
                  journals.data.items.map((journal) => (
                    <TableRow key={journal.id}>
                      <TableCell>
                        <Link
                          to="/journals/$id"
                          params={{ id: journal.id }}
                          className="font-semibold hover:text-brand"
                        >
                          {journal.title}
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {journal.publisher || "—"}
                      </TableCell>
                      <TableCell className="font-mono text-xs">{journal.issn || "—"}</TableCell>
                      <TableCell className="text-right font-mono">
                        {journal.totalPapersPublished.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                      No journals match your search.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </AppShell>
  );
}
