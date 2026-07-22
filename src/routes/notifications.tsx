import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { notifications } from "@/lib/mock-data";
import { Bell } from "lucide-react";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — Scigraph" },
      { name: "description", content: "Alerts about newly published papers in your followed journals and topics." },
    ],
  }),
  component: Notifications,
});

function Notifications() {
  return (
    <AppShell>
      <div className="p-8 max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="font-serif text-4xl mb-1">Notifications</h1>
          <p className="text-muted-foreground text-sm">Updates from your followed journals and topics.</p>
        </div>
        <div className="space-y-3">
          {notifications.map((n) => (
            <div key={n.id} className={`bg-surface border rounded-2xl p-5 flex gap-4 ${n.read ? "border-border" : "border-brand/40"}`}>
              <div className={`size-9 rounded-full grid place-items-center shrink-0 ${n.read ? "bg-secondary text-muted-foreground" : "bg-brand text-brand-foreground"}`}>
                <Bell className="size-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  <h3 className="font-semibold text-sm">{n.title}</h3>
                  <span className="text-[10px] font-mono uppercase text-muted-foreground">{n.time}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{n.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
