import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { MainLayout } from "@/app/layouts/main-layout";
import { ADMIN_ONLY } from "@/shared/auth/roles";
import { useAdminUsers } from "@/features/admin/api/admin-api";
import { Loader2, UserPlus } from "lucide-react";
import { DateDisplay } from "@/shared/ui/custom-date";
import { FilterSelect } from "@/shared/ui/filter-select";
import { Pagination } from "@/shared/ui/pagination";
import { SearchInput } from "@/shared/ui/search-input";

export const Route = createFileRoute("/admin/users")({
  head: () => ({
    meta: [
      { title: "Admin - Users - Scigraph" },
      { name: "description", content: "Manage user accounts and roles." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminUsers,
});

const pageSizeOptions = [5, 10, 20];

function AdminUsers() {
  const { data: users = [], isLoading, isError, error } = useAdminUsers();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [verifiedFilter, setVerifiedFilter] = useState("all");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);

  const roles = useMemo(
    () => Array.from(new Set(users.map((user) => user.role).filter(Boolean))).sort(),
    [users],
  );

  const filteredUsers = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        !keyword ||
        [user.fullName, user.email, user.role, user.status]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(keyword));
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      const matchesStatus = statusFilter === "all" || user.status === statusFilter;
      const matchesVerified =
        verifiedFilter === "all" ||
        (verifiedFilter === "verified" ? user.isEmailVerified : !user.isEmailVerified);

      return matchesSearch && matchesRole && matchesStatus && matchesVerified;
    });
  }, [search, roleFilter, statusFilter, verifiedFilter, users]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * pageSize;
  const paginatedUsers = filteredUsers.slice(pageStart, pageStart + pageSize);
  const visibleStart = filteredUsers.length === 0 ? 0 : pageStart + 1;
  const visibleEnd = Math.min(pageStart + pageSize, filteredUsers.length);

  const setSearchAndReset = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const setFilterAndReset = (setter: (value: string) => void, value: string) => {
    setter(value);
    setPage(1);
  };

  return (
    <MainLayout roles={ADMIN_ONLY}>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-xs uppercase tracking-widest font-bold text-muted-foreground mb-2">Administration</div>
            <h1 className="font-serif text-4xl">Users</h1>
            <p className="text-sm text-muted-foreground mt-2">
              {users.length} total accounts, {filteredUsers.length} matching current filters.
            </p>
          </div>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:opacity-90">
            <UserPlus className="size-4" />
            Invite user
          </button>
        </div>

        <div className="mb-4 border border-border bg-surface rounded-2xl p-4">
          <div className="grid gap-3 lg:grid-cols-[minmax(260px,1fr)_160px_160px_170px]">
            <SearchInput value={search} onChange={setSearchAndReset} placeholder="Search name, email, role..." />
            <FilterSelect
              label="Role"
              value={roleFilter}
              onChange={(value) => setFilterAndReset(setRoleFilter, value)}
              options={[
                { label: "All roles", value: "all" },
                ...roles.map((role) => ({ label: role ?? "", value: role ?? "" })),
              ]}
            />
            <FilterSelect
              label="Status"
              value={statusFilter}
              onChange={(value) => setFilterAndReset(setStatusFilter, value)}
              options={[
                { label: "All status", value: "all" },
                { label: "Active", value: "Active" },
                { label: "Inactive", value: "Inactive" },
              ]}
            />
            <FilterSelect
              label="Verified"
              value={verifiedFilter}
              onChange={(value) => setFilterAndReset(setVerifiedFilter, value)}
              options={[
                { label: "All verification", value: "all" },
                { label: "Verified", value: "verified" },
                { label: "Unverified", value: "unverified" },
              ]}
            />
          </div>
        </div>

        <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 p-10 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Loading users...
            </div>
          ) : isError ? (
            <div className="p-10 text-sm text-destructive">
              Failed to load users: {(error as Error).message}
            </div>
          ) : users.length === 0 ? (
            <EmptyState title="No users found" description="There are no accounts returned by the API yet." />
          ) : filteredUsers.length === 0 ? (
            <EmptyState title="No matching users" description="Try changing the search text or filters." />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[920px] text-sm">
                  <thead className="border-b border-border bg-secondary/35">
                    <tr className="text-left text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                      <th className="px-6 py-3">Name</th>
                      <th className="px-6 py-3">Email</th>
                      <th className="px-6 py-3">Role</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Verified</th>
                      <th className="px-6 py-3 text-right">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {paginatedUsers.map((user) => (
                      <tr key={user.id} className="transition-colors hover:bg-secondary/45">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand/15 text-xs font-bold text-brand">
                              {getInitials(user.fullName || user.email)}
                            </span>
                            <span className="font-semibold">{user.fullName || "Unnamed user"}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{user.email}</td>
                        <td className="px-6 py-4">
                          <span className="rounded-md bg-secondary px-2 py-1 text-xs font-medium">{user.role}</span>
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={user.status} />
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {user.isEmailVerified ? "Verified" : "Unverified"}
                        </td>
                        <td className="px-6 py-4 text-right font-mono text-xs text-muted-foreground">
                          <DateDisplay value={user.createdAt} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination
                page={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                pageSizeOptions={pageSizeOptions}
                visibleStart={visibleStart}
                visibleEnd={visibleEnd}
                totalItems={filteredUsers.length}
                onPageChange={setPage}
                onPageSizeChange={(value) => {
                  setPageSize(value);
                  setPage(1);
                }}
                className="border-t border-border px-4 py-3"
              />
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="p-12 text-center">
      <p className="font-semibold">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function StatusBadge({ status }: { status?: string | null }) {
  const active = status === "Active";

  return (
    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded ${active ? "bg-trend-up/10 text-trend-up" : "bg-destructive/10 text-destructive"}`}>
      {status ?? "-"}
    </span>
  );
}

function getInitials(value?: string | null) {
  return (
    value
      ?.split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "U"
  );
}
