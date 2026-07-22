import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import {
  LayoutDashboard,
  TrendingUp,
  BookOpen,
  Newspaper,
  Bookmark,
  Bell,
  Users,
  Database,
  Search,
  Sigma,
} from "lucide-react";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/topics", label: "Trend Explorer", icon: TrendingUp },
  { to: "/papers", label: "Research Library", icon: BookOpen },
  { to: "/journals", label: "Journal Tracker", icon: Newspaper },
  { to: "/bookmarks", label: "Bookmarks", icon: Bookmark },
  { to: "/notifications", label: "Notifications", icon: Bell },
] as const;

const admin = [
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/data-sources", label: "API Data Sources", icon: Database },
] as const;

const savedInterests = [
  { to: "/topics/t1", label: "NeuralArchitectures" },
  { to: "/topics/t4", label: "GeneEditing" },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isActive = (to: string) => (to === "/" ? pathname === "/" : pathname.startsWith(to));

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 border-r border-border bg-sidebar flex flex-col sticky top-0 h-screen">
        <div className="p-6 border-b border-border flex items-center gap-3">
          <div className="size-8 bg-brand rounded-lg grid place-items-center text-brand-foreground">
            <Sigma className="size-4" />
          </div>
          <span className="font-bold tracking-tight text-lg">Scigraph</span>
        </div>

        <nav className="p-4 flex-1 space-y-1 overflow-y-auto">
          {nav.map((n) => {
            const Icon = n.icon;
            const active = isActive(n.to);
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                  active
                    ? "bg-secondary text-brand font-medium"
                    : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                }`}
              >
                <Icon className="size-4" />
                {n.label}
              </Link>
            );
          })}

          <div className="pt-6 pb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Saved Interests
          </div>
          {savedInterests.map((s) => (
            <Link
              key={s.to}
              to={s.to}
              className="flex items-center gap-3 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground italic rounded-md hover:bg-secondary/60"
            >
              # {s.label}
            </Link>
          ))}

          <div className="pt-6 pb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Administration
          </div>
          {admin.map((n) => {
            const Icon = n.icon;
            const active = isActive(n.to);
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                  active
                    ? "bg-secondary text-brand font-medium"
                    : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                }`}
              >
                <Icon className="size-4" />
                {n.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <Link
            to="/auth"
            className="block bg-primary rounded-xl p-4 text-primary-foreground hover:opacity-90 transition-opacity"
          >
            <p className="text-xs text-primary-foreground/60 mb-1">Researcher Access</p>
            <p className="text-sm font-medium">Dr. Aris Thorne</p>
            <p className="text-[10px] text-primary-foreground/60 mt-1">Sign in / switch account</p>
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-10 px-8 flex items-center justify-between">
          <div className="relative w-96 max-w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search papers, topics, authors, DOI..."
              className="w-full pl-10 pr-4 py-2 bg-secondary rounded-full text-sm outline-none focus:ring-2 focus:ring-brand/30"
            />
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="hidden md:inline text-muted-foreground font-mono text-xs">
              API: <span className="text-trend-up">Active</span> (IEEE, ArXiv, PubMed)
            </span>
            <Link
              to="/notifications"
              className="relative size-9 grid place-items-center rounded-full hover:bg-secondary transition-colors"
            >
              <Bell className="size-4" />
              <span className="absolute top-2 right-2 size-1.5 bg-brand rounded-full" />
            </Link>
            <button className="px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-secondary transition-colors">
              Export Report
            </button>
          </div>
        </header>

        <div className="flex-1 min-w-0">{children}</div>
      </main>
    </div>
  );
}
