import { createFileRoute } from "@tanstack/react-router";
import { MainLayout } from "@/app/layouts/main-layout";
import { ADMIN_ONLY } from "@/shared/auth/roles"; // or a Researcher+Admin role set if you have one
import { ImportPaperByLinkForm } from "@/routes/import-paper-form";

export const Route = createFileRoute("/import")({
  head: () => ({
    meta: [
      { title: "Import Paper - Scigraph" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ImportPaperPage,
});

function ImportPaperPage() {
  return (
    <MainLayout roles={ADMIN_ONLY}>
      <div className="mx-auto max-w-2xl p-6 lg:p-8">
        <div className="mb-6">
          <div className="text-xs uppercase tracking-widest font-bold text-muted-foreground mb-2">
            Research Library
          </div>
          <h1 className="font-serif text-4xl">Import a paper</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Pull a single paper into Scigraph by DOI, OpenAlex ID, or Semantic Scholar ID.
          </p>
        </div>
        <ImportPaperByLinkForm />
      </div>
    </MainLayout>
  );
}