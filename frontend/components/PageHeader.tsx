export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  accent = "#059669",
  icon,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  accent?: string;
  icon?: React.ReactNode;
}) {
  return (
    <header className="page-header">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex gap-4">
          <div
            className="page-header-icon"
            style={{ color: accent, backgroundColor: `${accent}18` }}
          >
            {icon ?? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M4 18 L8 12 L12 15 L16 8 L20 11"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>
          <div>
            {eyebrow ? (
              <p className="text-xs font-medium uppercase tracking-wide text-muted">
                {eyebrow}
              </p>
            ) : null}
            <h1 className="text-2xl font-semibold text-primary">{title}</h1>
            {description ? (
              <p className="page-header-desc mt-1 max-w-2xl text-sm text-secondary">
                {description}
              </p>
            ) : null}
          </div>
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
    </header>
  );
}
