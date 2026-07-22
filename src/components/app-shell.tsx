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
  Loader2,
  ChevronDown,
  LogOut,
} from "lucide-react";
import { useGenerateReport } from "@/lib/queries";
import { useAuth, roleLabel } from "@/lib/auth";
import { ADMIN_ONLY, ALL_AUTHENTICATED_ROLES, hasAnyRole, type Role } from "@/shared/auth/roles";
import { ThemeToggle } from "@/features/theme/ui/theme-toggle";
import { Logo } from "@/shared/ui/logo";
import { motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ALL_AUTHENTICATED_ROLES },
  { to: "/topics", label: "Trend Explorer", icon: TrendingUp, roles: ALL_AUTHENTICATED_ROLES },
  { to: "/papers", label: "Research Library", icon: BookOpen, roles: ALL_AUTHENTICATED_ROLES },
  { to: "/journals", label: "Journal Tracker", icon: Newspaper, roles: ALL_AUTHENTICATED_ROLES },
  { to: "/bookmarks", label: "Bookmarks", icon: Bookmark, roles: ALL_AUTHENTICATED_ROLES },
  { to: "/notifications", label: "Notifications", icon: Bell, roles: ALL_AUTHENTICATED_ROLES },
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
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const [globalSearch, setGlobalSearch] = useState("");
  const isActive = (to: string) => pathname === to || pathname.startsWith(`${to}/`);
  const generateReport = useGenerateReport();
  const { user, logout } = useAuth();
  const userRole = user?.role as Role | undefined;
  const displayName = user?.name || user?.email || "User";
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "U";
  const handleLogout = () => {
    logout();
    navigate({ to: "/auth", search: { mode: "signin" }, replace: true });
  };
  const handleGlobalSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    navigate({
      to: "/papers",
      search: { q: globalSearch.trim() },
    });
  };

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      {/* Sidebar */}
      <motion.aside
        className="w-64 shrink-0 border-r border-border bg-sidebar flex flex-col sticky top-0 h-screen"
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.div
          className="p-6 border-b border-border flex items-center gap-3"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.22 }}
        >
          <Logo
            link={false}
            markClassName="size-8 rounded-xl"
            textClassName="font-bold tracking-tight text-lg"
          />
        </motion.div>

        <nav className="p-4 flex-1 space-y-1 overflow-y-auto">
          {nav.filter((n) => hasAnyRole(userRole, n.roles)).map((n) => {
            const Icon = n.icon;
            const active = isActive(n.to);
            return (
              <motion.div
                key={n.to}
                whileHover={{ x: 2 }}
                transition={{ duration: 0.16 }}
              >
                <Link
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
              </motion.div>
            );
          })}

          {hasAnyRole(userRole, ADMIN_ONLY) && (
            <>
              <div className="pt-6 pb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Administration
              </div>
              {admin.map((n) => {
                const Icon = n.icon;
                const active = isActive(n.to);
                return (
                  <motion.div
                    key={n.to}
                    whileHover={{ x: 2 }}
                    transition={{ duration: 0.16 }}
                  >
                    <Link
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
                  </motion.div>
                );
              })}
            </>
          )}
        </nav>
      </motion.aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0">
        <motion.header
          className="h-16 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-10 px-8 flex items-center justify-between"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
        >
          <form onSubmit={handleGlobalSearch} className="relative w-96 max-w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              value={globalSearch}
              onChange={(event) => setGlobalSearch(event.target.value)}
              placeholder="Search papers, topics, authors, DOI..."
              className="w-full pl-10 pr-4 py-2 bg-secondary rounded-full text-sm outline-none focus:ring-2 focus:ring-brand/30"
            />
          </form>
          <div className="flex items-center gap-4 text-sm">
            <Link
              to="/notifications"
              className="relative grid size-9 place-items-center rounded-full border border-border hover:bg-secondary transition-colors"
              title="Notifications"
            >
              <Bell className="size-4" />
            </Link>
            <ThemeToggle />
            {hasAnyRole(userRole, ALL_AUTHENTICATED_ROLES) ? (
              <>
                <button
                  onClick={() => generateReport.mutate()}
                  disabled={generateReport.isPending}
                  className="px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-secondary transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {generateReport.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
                  {generateReport.isPending ? "Exporting..." : "Export Report"}
                </button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="flex max-w-64 items-center gap-3 rounded-full border border-border bg-surface px-2 py-1.5 text-left transition-colors hover:bg-secondary"
                    >
                      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-brand text-xs font-bold text-brand-foreground">
                        {initials}
                      </span>
                      <span className="hidden min-w-0 lg:block">
                        <span className="block truncate text-sm font-semibold leading-4">{displayName}</span>
                        <span className="block text-xs text-muted-foreground">{roleLabel(user?.role)} Access</span>
                      </span>
                      <ChevronDown className="hidden size-4 shrink-0 text-muted-foreground lg:block" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64">
                    <DropdownMenuLabel>
                      <span className="block truncate text-sm">{displayName}</span>
                      <span className="block truncate text-xs font-normal text-muted-foreground">
                        {user?.email ?? roleLabel(user?.role)}
                      </span>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="cursor-pointer text-destructive focus:text-destructive"
                    >
                      <LogOut className="size-4" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Link
                to="/auth"
                search={{ mode: "signin" }}
                className="px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-secondary transition-colors"
              >
                Sign in
              </Link>
            )}
          </div>
        </motion.header>

        <motion.div
          key={pathname}
          className="flex-1 min-w-0"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
