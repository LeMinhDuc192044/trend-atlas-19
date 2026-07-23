import { useState, type ReactNode } from "react";
import { X, Loader2, LinkIcon } from "lucide-react";
import { useResearchTopics } from "@/features/research/api/research-api";
import {
  useImportSinglePaper,
  type ImportSinglePaperResult,
} from "@/hooks/use-papers";

// ── Types ─────────────────────────────────────────────────────────────────────

const API_SOURCE_OPTIONS = [
  { label: "Semantic Scholar", value: "semanticscholar" },
  { label: "OpenAlex",         value: "openalex"        },
  { label: "Crossref",         value: "crossref"        },
];

interface ImportDialogProps {
  onClose: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function ImportDialog({ onClose }: ImportDialogProps) {
  const [link,      setLink]      = useState("");
  const [apiSource, setApiSource] = useState("semanticscholar");
  const [topicIds,  setTopicIds]  = useState<string[]>([]);

  const [result,   setResult]   = useState<ImportSinglePaperResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { data: topics = [] } = useResearchTopics();
  const importPaper = useImportSinglePaper();

  function toggleTopic(id: string) {
    setTopicIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  }

  async function handleSubmit() {
    if (!link.trim()) return;
    setResult(null);
    setErrorMsg(null);

    try {
      const res = await importPaper.mutateAsync({
        link: link.trim(),
        apiSource,
        researchTopicIds: topicIds,
      });
      setResult(res);
      setLink("");
      setTopicIds([]);
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "Import failed");
    }
  }

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg rounded-3xl border border-border bg-background shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="grid size-7 place-items-center rounded-lg bg-brand/10">
              <LinkIcon className="size-3.5 text-brand" />
            </div>
            <h2 className="font-serif text-xl">Import by DOI / Link</h2>
          </div>
          <button
            onClick={onClose}
            className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-5 p-6">

          {/* Link / DOI */}
          <Field label="Paper DOI or Link">
            <input
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://doi.org/10.xxxx/... or 10.xxxx/..."
              className="w-full rounded-xl border border-border bg-secondary px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand/30"
            />
            <p className="mt-1 text-[11px] text-muted-foreground">
              Accepted: DOI URL · raw DOI · OpenAlex work ID · Semantic Scholar paper ID
            </p>
          </Field>

          {/* API Source */}
          <Field label="Fetch from">
            <div className="grid grid-cols-3 gap-2">
              {API_SOURCE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setApiSource(opt.value)}
                  className={`rounded-xl border px-3 py-2 text-xs font-semibold transition-colors ${
                    apiSource === opt.value
                      ? "border-brand/40 bg-brand/10 text-brand"
                      : "border-border text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </Field>

          {/* Topic selector */}
          <Field label={`Link to Research Topics ${topicIds.length > 0 ? `(${topicIds.length} selected)` : "(optional)"}`}>
            <div className="max-h-44 overflow-y-auto rounded-xl border border-border bg-secondary p-2 space-y-0.5">
              {topics.length === 0 ? (
                <p className="py-3 text-center text-xs text-muted-foreground">
                  No research topics found
                </p>
              ) : (
                topics.map((t) => {
                  const id = t.id ?? "";
                  const checked = topicIds.includes(id);
                  return (
                    <label
                      key={id}
                      className={`flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                        checked ? "bg-brand/10 text-brand" : "hover:bg-background"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleTopic(id)}
                        className="accent-brand"
                      />
                      <span className="font-medium">{t.name}</span>
                    </label>
                  );
                })
              )}
            </div>
          </Field>

          {/* Success */}
          {result && (
            <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-sm">
              <p className="font-semibold text-green-700 dark:text-green-400">
                ✓ Paper imported successfully
              </p>
              <p className="mt-1 text-muted-foreground line-clamp-2">{result.title}</p>
              {result.linkedTopicNames.length > 0 && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Linked to: {result.linkedTopicNames.join(", ")}
                </p>
              )}
            </div>
          )}

          {/* Error */}
          {errorMsg && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              ✗ {errorMsg}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border px-6 py-4">
          <p className="text-xs text-muted-foreground">
            Only metadata is collected — no full text
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="rounded-xl border border-border px-4 py-2 text-sm font-medium hover:bg-secondary transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleSubmit}
              disabled={importPaper.isPending || !link.trim()}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {importPaper.isPending && <Loader2 className="size-3.5 animate-spin" />}
              {importPaper.isPending ? "Importing…" : "Import Paper"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

// ── Tiny helper ───────────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}