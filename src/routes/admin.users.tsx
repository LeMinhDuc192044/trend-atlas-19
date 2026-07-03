import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";

export const Route = createFileRoute("/admin/users")({
  head: () => ({
    meta: [
      { title: "Admin · Users — Scigraph" },
      { name: "description", content: "Manage user accounts and roles." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminUsers,
});

const users = [
  { id: "u1", name: "Dr. Aris Thorne", email: "aris@lab.io", role: "Researcher", status: "Active" },
  { id: "u2", name: "Prof. Nadia Rahimi", email: "nadia@uni.edu", role: "Lecturer", status: "Active" },
  { id: "u3", name: "Kenji Watanabe", email: "kenji@grad.edu", role: "Student", status: "Pending" },
  { id: "u4", name: "System Bot", email: "sys@scigraph.io", role: "Admin", status: "Active" },
];

function AdminUsers() {
  return (
    <AppShell>
      <div className="p-8 max-w-6xl mx-auto">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <div className="text-xs uppercase tracking-widest font-bold text-muted-foreground mb-2">Administration</div>
            <h1 className="font-serif text-4xl">Users</h1>
          </div>
          <button className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:opacity-90">
            Invite user
          </button>
        </div>

        <div className="bg-surface border border-border rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-border">
              <tr className="text-left text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-secondary/50">
                  <td className="px-6 py-4 font-semibold">{u.name}</td>
                  <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{u.email}</td>
                  <td className="px-6 py-4">{u.role}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded ${u.status === "Active" ? "bg-trend-up/10 text-trend-up" : "bg-accent text-indigo"}`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-xs font-medium text-muted-foreground hover:text-foreground">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
