import { formatTime } from "@/lib/api";

export function SyncBadge({
  label,
  recordedAt,
}: {
  label: string;
  recordedAt: string | null | undefined;
}) {
  if (!recordedAt) return null;

  return (
    <span className="sync-badge" title={`${label} : ${formatTime(recordedAt)}`}>
      <span className="sync-badge-dot" aria-hidden />
      Dernière sync · {formatTime(recordedAt)}
    </span>
  );
}
