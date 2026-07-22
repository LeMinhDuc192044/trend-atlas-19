import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, type FormEvent, type ReactNode } from "react";
import {
  Bell,
  Bookmark,
  BookOpen,
  Database,
  LayoutDashboard,
  Menu,
  Newspaper,
  Search,
  Sigma,
  TrendingUp,
  Users,
  BellRing,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { roleLabel, useAuth } from "@/lib/auth";
import { notificationService } from "@/api/services";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/topics", label: "Trend Explorer", icon: TrendingUp },
  { to: "/papers", label: "Research Library", icon: BookOpen },
  { to: "/journals", label: "Journal Tracker", icon: Newspaper },
  { to: "/bookmarks", label: "Bookmarks", icon: Bookmark },
  { to: "/following", label: "Following", icon: BellRing },
  { to: "/notifications", label: "Notifications", icon: Bell },
] as const;
const admin = [
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/data-sources", label: "API Data Sources", icon: Database },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const { user, authLoading } = useAuth();
  const unread = useQuery({
    queryKey: ["notifications", "unread"],
    queryFn: () => notificationService.list(false),
    enabled: Boolean(user),
    retry: false,
    refetchInterval: 30_000,
  });
  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    const query = search.trim();
    if (query) navigate({ to: "/papers", search: { query } });
  };
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-border bg-sidebar lg:flex lg:flex-col">
        <Brand />
        <Nav pathname={pathname} isAdmin={user?.role === 0} />
        <Account />
      </aside>
      <main className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center gap-3 border-b border-border bg-background/90 px-4 backdrop-blur-md md:px-8">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="lg:hidden"
                aria-label="Open navigation"
              >
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex w-72 flex-col p-0">
              <SheetHeader className="sr-only">
                <SheetTitle>Navigation</SheetTitle>
              </SheetHeader>
              <Brand />
              <Nav pathname={pathname} isAdmin={user?.role === 0} mobile />
              <Account />
            </SheetContent>
          </Sheet>
          <form onSubmit={submitSearch} className="relative min-w-0 max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search papers…"
              className="h-9 w-full rounded-full bg-secondary pl-9 pr-4 text-sm outline-none ring-brand/30 focus:ring-2"
            />
          </form>
          <Button asChild size="icon" variant="ghost" className="relative">
            <Link
              to="/notifications"
              aria-label={`${unread.data?.totalCount ?? 0} unread notifications`}
            >
              <Bell />
              {(unread.data?.totalCount ?? 0) > 0 ? (
                <span className="absolute right-0 top-0 grid min-w-4 -translate-y-0.5 translate-x-0.5 place-items-center rounded-full bg-destructive px-1 text-[10px] leading-4 text-destructive-foreground">
                  {unread.data!.totalCount > 99 ? "99+" : unread.data!.totalCount}
                </span>
              ) : null}
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
            <Link to="/auth">
              {authLoading ? "Account" : user ? user.name || user.email : "Sign in"}
            </Link>
          </Button>
        </header>
        <div className="min-w-0 flex-1">{children}</div>
      </main>
    </div>
  );
}

function Brand() {
  return (
    <Link to="/" className="flex items-center gap-3 border-b border-border p-6">
      <div className="grid size-8 place-items-center rounded-lg bg-brand text-brand-foreground">
        <Sigma />
      </div>
      <span className="text-lg font-bold tracking-tight">Scigraph</span>
    </Link>
  );
}

function Nav({
  pathname,
  isAdmin,
  mobile = false,
}: {
  pathname: string;
  isAdmin: boolean;
  mobile?: boolean;
}) {
  const active = (to: string) => (to === "/" ? pathname === "/" : pathname.startsWith(to));
  const items = isAdmin ? [...nav, ...admin] : nav;
  return (
    <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-4">
      {items.map((item, index) => {
        const Icon = item.icon;
        const link = (
          <Link
            to={item.to}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
              active(item.to)
                ? "bg-secondary font-medium text-brand"
                : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
              isAdmin && index === nav.length && "mt-5",
            )}
          >
            <Icon />
            {item.label}
          </Link>
        );
        return mobile ? (
          <SheetClose asChild key={item.to}>
            {link}
          </SheetClose>
        ) : (
          <div key={item.to}>{link}</div>
        );
      })}
    </nav>
  );
}

function Account() {
  const { user, authLoading } = useAuth();
  const initials = (authLoading ? "Account" : user?.name || user?.email || "Guest")
    .split(/\s|@/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
  return (
    <div className="border-t border-border p-4">
      <Link to="/auth" className="flex items-center gap-3 rounded-xl p-2 hover:bg-secondary">
        <Avatar>
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">
            {authLoading ? "Loading account…" : user?.name || user?.email || "Guest researcher"}
          </p>
          <p className="text-xs text-muted-foreground">
            {authLoading
              ? "Checking session"
              : user
                ? roleLabel(user.role)
                : "Sign in to personalize"}
          </p>
        </div>
      </Link>
    </div>
  );
}
