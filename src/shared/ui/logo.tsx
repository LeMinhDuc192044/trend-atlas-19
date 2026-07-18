import { Link } from "@tanstack/react-router";

interface LogoMarkProps {
  className?: string;
}

interface LogoProps {
  className?: string;
  markClassName?: string;
  textClassName?: string;
  link?: boolean;
}

export function LogoMark({ className = "size-9" }: LogoMarkProps) {
  return (
    <span
      className={`relative grid shrink-0 place-items-center overflow-hidden rounded-2xl bg-linear-to-br from-brand via-sky-500 to-emerald-400 text-white shadow-lg shadow-brand/20 ${className}`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 36 36" fill="none" className="size-[72%]">
        <path
          d="M9 10.7c3.5-.9 6.4-.3 8.9 1.7 2.5-2 5.5-2.6 9.1-1.7v13.7c-3.3-.7-6.2-.2-9.1 1.7-2.8-1.9-5.7-2.4-8.9-1.7V10.7Z"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinejoin="round"
        />
        <path d="M17.9 12.4v13.7" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
        <path
          d="M12 21.2c2.2-3.3 4.2-3 6-1.1 2.2 2.3 4.1 1.3 6.1-3.4"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="21.2" r="1.6" fill="currentColor" />
        <circle cx="18" cy="20.1" r="1.6" fill="currentColor" />
        <circle cx="24.1" cy="16.7" r="1.6" fill="currentColor" />
      </svg>
      <span className="absolute inset-x-1 top-1 h-3 rounded-full bg-white/20 blur-sm" />
    </span>
  );
}

export function Logo({
  className = "inline-flex items-center gap-3",
  markClassName,
  textClassName = "text-lg font-bold tracking-tight",
  link = true,
}: LogoProps) {
  const content = (
    <>
      <LogoMark className={markClassName} />
      <span className={textClassName}>Scigraph</span>
    </>
  );

  if (!link) {
    return <div className={className}>{content}</div>;
  }

  return (
    <Link to="/" className={className}>
      {content}
    </Link>
  );
}
