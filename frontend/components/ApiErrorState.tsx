export function ApiErrorState({
  title = "API indisponible",
  hint = "Lancez le backend FastAPI sur le port 8000, puis exécutez POST /ingest/run.",
  detail,
  className = "mb-8",
}: {
  title?: string;
  hint?: string;
  detail?: string | null;
  className?: string;
}) {
  return (
    <div className={`empty-state ${className}`}>
      <p className="font-medium text-primary">{title}</p>
      <p className="mt-2 text-sm text-secondary">
        Le backend GridPulse ne répond pas pour le moment — les données affichées peuvent être
        incomplètes.
      </p>
      <p className="mt-2 text-xs text-muted">{hint}</p>
      {detail ? (
        <details className="mt-3 text-left">
          <summary className="cursor-pointer text-xs text-muted">Détail technique</summary>
          <p className="mt-1 text-xs text-muted">{detail}</p>
        </details>
      ) : null}
    </div>
  );
}
