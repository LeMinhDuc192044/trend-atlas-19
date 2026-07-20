import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Sigma } from "lucide-react";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Scigraph" },
      { name: "description", content: "Sign in or create an account to track research trends." },
    ],
  }),
  component: Auth,
});

function Auth() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { login, register, loading, authLoading, user, logout } = useAuth();
  const navigate = useNavigate();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      if (mode === "signin") await login(email, password);
      else await register(name, email, password);
      navigate({ to: "/" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <div className="hidden lg:flex flex-col justify-between p-12 bg-primary text-primary-foreground">
        <Link to="/" className="flex items-center gap-3">
          <div className="size-8 bg-brand rounded-lg grid place-items-center">
            <Sigma className="size-4 text-brand-foreground" />
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
  );
}
