import { Link } from "@tanstack/react-router";
import { Home } from "lucide-react";
import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { ThemeToggle } from "@/features/theme/ui/theme-toggle";
import { Logo } from "@/shared/ui/logo";
import heroImage from "@/assets/auth/research-signal-hero.png";

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen bg-background text-foreground lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative hidden overflow-hidden bg-[#edf4fa] p-10 text-slate-950 dark:bg-background dark:text-foreground lg:flex lg:flex-col lg:justify-between">
        <motion.img
          src={heroImage}
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-left opacity-90 dark:opacity-35 dark:mix-blend-screen"
          initial={{ scale: 1.04, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.9 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        />
        <div className="absolute inset-0 bg-linear-to-r from-[#edf4fa]/95 via-[#edf4fa]/82 to-[#edf4fa]/20 dark:from-background dark:via-background/86 dark:to-background/25" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-[#edf4fa] to-transparent dark:from-background" />

        <motion.div
          className="relative z-10"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <Logo textClassName="text-xl font-bold tracking-tight" />
        </motion.div>

        <motion.div
          className="relative z-10 max-w-2xl"
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="mb-5 inline-flex rounded-full border border-slate-900/10 bg-white/65 px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm backdrop-blur dark:border-border dark:bg-surface/70 dark:text-muted-foreground">
            Research intelligence workspace
          </div>
          <h1 className="mb-5 max-w-3xl text-balance font-serif text-6xl leading-[0.95]">
            The publication signal, beautifully indexed.
          </h1>
          <p className="max-w-lg text-lg leading-7 text-slate-600 dark:text-muted-foreground">
            Search papers, follow journals, and watch citation momentum become clear across every academic domain.
          </p>
        </motion.div>

        <motion.div
          className="relative z-10 flex items-center justify-between text-xs text-slate-500 dark:text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.35 }}
        >
          <span className="font-mono">Copyright {new Date().getFullYear()} Scigraph Research</span>
          <span className="hidden rounded-full bg-white/60 px-3 py-1 font-mono backdrop-blur dark:bg-surface/70 xl:inline">
            Papers - Journals - Topics
          </span>
        </motion.div>
      </section>

      <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-6 text-foreground lg:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(37,99,235,0.18),transparent_34%),radial-gradient(circle_at_20%_80%,rgba(16,185,129,0.10),transparent_28%)] dark:bg-[radial-gradient(circle_at_75%_20%,rgba(37,99,235,0.24),transparent_34%),radial-gradient(circle_at_20%_80%,rgba(16,185,129,0.12),transparent_28%)]" />
        <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(15,23,42,.5)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,.5)_1px,transparent_1px)] [background-size:48px_48px] dark:[background-image:linear-gradient(rgba(255,255,255,.5)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.5)_1px,transparent_1px)]" />

        <Logo className="absolute left-6 top-6 z-20 flex items-center gap-3 lg:hidden" />

        <div className="absolute right-6 top-6 z-20 flex items-center gap-2">
          <Link
            to="/"
            className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-surface/75 px-4 text-sm font-semibold text-foreground shadow-sm backdrop-blur transition hover:bg-secondary"
          >
            <Home className="size-4" />
            Home
          </Link>
          <div className="rounded-full border border-border bg-surface/75 p-0.5 shadow-sm backdrop-blur">
            <ThemeToggle />
          </div>
        </div>

        <div className="relative z-10 w-full max-w-md">{children}</div>
      </section>
    </div>
  );
}
