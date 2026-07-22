import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Check, Eye, EyeOff } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { AuthLayout } from "@/app/layouts/auth-layout";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>) => ({
    mode: (search.mode === "signup" ? "signup" : "signin") as "signup" | "signin",
  }),
  head: () => ({
    meta: [
      { title: "Sign in - Scigraph" },
      { name: "description", content: "Sign in or create an account to track research trends." },
    ],
  }),
  component: Auth,
});

function Auth() {
  const search = Route.useSearch();
  const [mode, setMode] = useState<"signin" | "signup">(search.mode as "signin" | "signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login, register, loading, authLoading, user, logout } = useAuth();
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]> | null>(null);
  const { login, register, loading, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const rememberedEmail = window.localStorage.getItem("scigraph:remembered-email");
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  useEffect(() => {
    if (user) {
      navigate({ to: "/dashboard", replace: true });
    }
  }, [navigate, user]);

  useEffect(() => {
    setMode(search.mode as "signin" | "signup");
    setError(null);
    setValidationErrors(null);
  }, [search.mode]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setValidationErrors(null);
    try {
      if (mode === "signin") {
        if (rememberMe) {
          window.localStorage.setItem("scigraph:remembered-email", email);
        } else {
          window.localStorage.removeItem("scigraph:remembered-email");
        }
        await login(email, password);
      } else {
        await register(name, email, password);
      }
      navigate({ to: "/dashboard" });
    } catch (err: any) {
      setError(err instanceof Error ? err.message : "Authentication failed");
      if (err.validationErrors) {
        setValidationErrors(err.validationErrors);
      }
    }
  }

  function switchMode(nextMode: "signin" | "signup") {
    setMode(nextMode);
    setError(null);
    setValidationErrors(null);
  }

  const getFieldError = (field: string) => {
    if (!validationErrors) return null;
    const key = Object.keys(validationErrors).find((k) => k.toLowerCase() === field.toLowerCase());
    return key ? validationErrors[key][0] : null;
  };

  return (
    <AuthLayout>
      {user ? null : (
        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-3xl border border-border bg-surface/80 px-6 py-7 text-foreground shadow-2xl shadow-black/10 backdrop-blur-xl dark:bg-surface/75 dark:shadow-black/25 sm:px-8 md:px-10 md:py-9"
        >
          <div className="mb-8 text-center">
            <div className="mb-6 inline-flex rounded-full border border-border bg-secondary/70 p-1 text-xs font-semibold">
              <button
                type="button"
                onClick={() => switchMode("signin")}
                className={`rounded-full px-3 py-1.5 transition ${mode === "signin" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => switchMode("signup")}
                className={`rounded-full px-3 py-1.5 transition ${mode === "signup" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                Register
              </button>
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, x: mode === "signin" ? -12 : 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: mode === "signin" ? 12 : -12 }}
                transition={{ duration: 0.2 }}
              >
                <h2 className="mb-2 font-serif text-4xl">
                  {mode === "signin" ? "Welcome back" : "Create account"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {mode === "signin" ? "Continue tracking research signals." : "Start building your research workspace."}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
          <span className="font-bold text-lg">Scigraph</span>
        </Link>
        <div>
          <h1 className="font-serif text-5xl leading-tight mb-4 text-balance">
            The publication signal, quietly indexed.
          </h1>
          <p className="text-primary-foreground/70 max-w-md">
            Search papers, follow journals, and watch topics rise across every academic domain.
          </p>
        </div>
        <div className="text-xs font-mono text-primary-foreground/50">
          © {new Date().getFullYear()} Scigraph Research
        </div>
      </div>

      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {authLoading ? (
            <p className="text-sm text-muted-foreground">Checking your session…</p>
          ) : user ? (
            <div className="space-y-4">
              <h2 className="font-serif text-3xl">Signed in</h2>
              <p className="text-sm text-muted-foreground">
                {user.email ?? user.name ?? "Authenticated"}
              </p>
              <div className="flex gap-2">
                <Link
                  to="/"
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm"
                >
                  Go to dashboard
                </Link>
                <button
                  onClick={logout}
                  className="px-4 py-2 border border-border rounded-lg text-sm"
                >
                  Sign out
                </button>
              </div>
            </div>
          ) : (
            <>
              <h2 className="font-serif text-3xl mb-2">
                {mode === "signin" ? "Welcome back" : "Create an account"}
              </h2>
              <p className="text-sm text-muted-foreground mb-8">
                {mode === "signin"
                  ? "Sign in to continue tracking research."
                  : "Start tracking trends in seconds."}
              </p>

              <form className="space-y-4" onSubmit={onSubmit}>
                {mode === "signup" && (
                  <div>
                    <label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">
                      Full name
                    </label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="mt-1 w-full px-3 py-2 bg-secondary rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand/30"
                    />
                  </div>
                )}
                <div>
                  <label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 w-full px-3 py-2 bg-secondary rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand/30"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 w-full px-3 py-2 bg-secondary rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand/30"
                  />
                </div>

                {error && <p className="text-sm text-red-500">{error}</p>}

                <button
                  disabled={loading}
                  type="submit"
                  className="w-full py-2.5 bg-primary text-primary-foreground font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {loading ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
                </button>
              </form>

              <p className="mt-6 text-sm text-muted-foreground text-center">
                {mode === "signin" ? "New here?" : "Already have an account?"}{" "}
                <button
                  className="text-brand font-medium hover:underline"
                  onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
                >
                  {mode === "signin" ? "Create account" : "Sign in"}
                </button>
              </p>

              <div className="mt-8 text-center">
                <Link
                  to="/"
                  className="text-xs uppercase tracking-widest font-bold text-muted-foreground hover:text-foreground"
                >
                  Continue as guest →
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>

          <form className="space-y-5" onSubmit={onSubmit}>
            <AnimatePresence initial={false}>
              {mode === "signup" && (
                <motion.div
                  key="full-name"
                  initial={{ opacity: 0, height: 0, y: -8 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -8 }}
                  transition={{ duration: 0.22 }}
                  className="overflow-hidden"
                >
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Full name</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    autoComplete="name"
                    placeholder="Jane Researcher"
                    className="mt-1 h-12 w-full rounded-xl border border-border bg-background/75 px-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/60 focus:border-brand/70 focus:ring-4 focus:ring-brand/15"
                  />
                  {getFieldError("fullname") && (
                    <p className="mt-1 text-xs text-destructive">{getFieldError("fullname")}</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                placeholder="you@example.com"
                className="mt-1 h-12 w-full rounded-xl border border-border bg-background/75 px-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/60 focus:border-brand/70 focus:ring-4 focus:ring-brand/15"
              />
              {getFieldError("email") && (
                <p className="mt-1 text-xs text-destructive">{getFieldError("email")}</p>
              )}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Password</label>
              <div className="relative mt-1">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                  placeholder={mode === "signin" ? "Enter your password" : "Minimum 6 characters"}
                  className="h-12 w-full rounded-xl border border-border bg-background/75 py-2 pl-3 pr-10 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/60 focus:border-brand/70 focus:ring-4 focus:ring-brand/15"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {getFieldError("password") && (
                <p className="mt-1 text-xs text-destructive">{getFieldError("password")}</p>
              )}
            </motion.div>

            <AnimatePresence initial={false}>
              {mode === "signin" && (
                <motion.div
                  key="signin-options"
                  initial={{ opacity: 0, height: 0, y: -6 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="flex items-center justify-between gap-4 rounded-2xl border border-border/70 bg-background/35 px-3 py-2.5 text-sm">
                    <label className="group inline-flex cursor-pointer items-center gap-2.5 text-muted-foreground transition hover:text-foreground">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(event) => setRememberMe(event.target.checked)}
                        className="peer sr-only"
                      />
                      <span className="grid size-5 place-items-center rounded-full border border-border bg-surface text-transparent shadow-sm transition group-hover:border-brand/50 peer-focus-visible:ring-4 peer-focus-visible:ring-brand/15 peer-checked:border-brand/30 peer-checked:bg-brand/15 peer-checked:text-brand dark:peer-checked:bg-brand/20">
                        <Check className="size-3.5 stroke-[3]" />
                      </span>
                      <span className="font-medium">Remember me</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setValidationErrors(null);
                        setError("Password recovery is not available yet.");
                      }}
                      className="rounded-full px-2 py-1 font-semibold text-brand transition hover:bg-brand/10 hover:text-brand"
                    >
                      Forgot password?
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {error && !validationErrors && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <motion.button
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              type="submit"
              className="h-12 w-full rounded-xl bg-primary font-semibold text-primary-foreground shadow-lg shadow-primary/10 transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Please wait..." : mode === "signin" ? "Sign in" : "Create account"}
            </motion.button>
          </form>

        </motion.div>
      )}
    </AuthLayout>
  );
}
