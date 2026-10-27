import Link from "next/link";

export function EmptyState({ title, description, href, action, compact = false }: { title: string; description: string; href?: string; action?: string; compact?: boolean }) {
  return (
    <div className={compact ? "empty-state compact" : "empty-state"}>
      <span className="empty-calendar" aria-hidden="true"><svg viewBox="0 0 64 64" width="64" height="64"><rect x="10" y="14" width="44" height="40" rx="2" fill="none" stroke="currentColor" strokeWidth="4" /><path d="M18 8v12M46 8v12M10 26h44M22 36h8M36 36h8M22 46h8" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="square" /></svg></span>
      <h2>{title}</h2>
      <p>{description}</p>
      {href && action ? <Link className="more-link" href={href}>{action}<span aria-hidden="true">→</span></Link> : null}
    </div>
  );
}
