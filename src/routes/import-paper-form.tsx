import { useState } from "react";
import { Loader2, Import } from "lucide-react";
import { useImportPaperByLink, useResearchTopics } from "@/features/research/api/research-api";
import { FilterSelect } from "@/shared/ui/filter-select";

const sourceOptions = [
  { label: "OpenAlex", value: "openalex" },
  { label: "Semantic Scholar", value: "semanticscholar" },
  { label: "Crossref", value: "crossref" },
];

export function ImportPaperByLinkForm() {
  const [link, setLink] = useState("");
  const [apiSource, setApiSource] = useState("openalex");
  const [topicIds, setTopicIds] = useState<string[]>([]);
  const { data: topics } = useResearchTopics();
  const importPaper = useImportPaperByLink();

  const toggleTopic = (id: string) => {
    setTopicIds((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));
  };

  const handleSubmit = () => {
    if (!link.trim()) return;
    importPaper.mutate(
      { link: link.trim(), apiSource, researchTopicIds: topicIds },
      {
        onSuccess: () => {
          setLink("");
          setTopicIds([]);
        },
      },
    );
  };

  return (
    <div className="rounded-3xl border border-border bg-surface p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <div className="grid size-7 place-items-center rounded-lg bg-brand/10">
          <Import className="size-3.5 text-brand" />
        </div>
        <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
          Import paper by link
        </h2>
      </div>

      <div className="space-y-3">
        <input
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="DOI, doi.org link, or OpenAlex/S2 ID..."
          className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-brand/40"
        />

        <FilterSelect
          label="Source"
          value={apiSource}
          onChange={setApiSource}
          options={sourceOptions}
        />

        {topics && topics.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {topics.map((topic) => (
              <button
                key={topic.id}
                type="button"
                onClick={() => topic.id && toggleTopic(topic.id)}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                  topic.id && topicIds.includes(topic.id)
                    ? "border-brand/30 bg-brand/10 text-brand"
                    : "border-border bg-background hover:bg-secondary"
                }`}
              >
                {topic.name}
              </button>
            ))}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={!link.trim() || importPaper.isPending}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
        >
          {importPaper.isPending ? <Loader2 className="size-4 animate-spin" /> : <Import className="size-4" />}
          {importPaper.isPending ? "Importing..." : "Import paper"}
        </button>

        {importPaper.isError && (
          <p className="text-sm text-destructive">
            {(importPaper.error as any)?.message ?? "Import failed. Check the link and try again."}
          </p>
        )}
        {importPaper.isSuccess && importPaper.data && (
          <p className="text-sm text-emerald-600 dark:text-emerald-400">
            Imported "{importPaper.data.title}" — linked to {importPaper.data.linkedTopicNames?.length ?? 0} topic(s).
          </p>
        )}
      </div>
    </div>
  );
}