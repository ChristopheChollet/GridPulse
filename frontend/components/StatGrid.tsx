export type StatItem = {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "default" | "ok" | "warn";
};

export function StatGrid({ items }: { items: StatItem[] }) {
  return (
    <div className="stat-grid">
      {items.map((item) => (
        <div
          key={item.label}
          className={`stat-card${item.tone === "ok" ? " stat-card-ok" : ""}${item.tone === "warn" ? " stat-card-warn" : ""}`}
        >
          <p className="stat-label">{item.label}</p>
          <p className="stat-value">{item.value}</p>
          {item.hint ? <p className="stat-hint">{item.hint}</p> : null}
        </div>
      ))}
    </div>
  );
}
