/** Normalise des valeurs numériques en hauteurs CSS % pour le mini-chart hero. */
export function valuesToBarHeightPcts(
  values: readonly number[],
  count = 6,
  minPct = 28,
  maxPct = 92,
): string[] {
  const slice = values.filter((v) => Number.isFinite(v)).slice(-count);
  if (slice.length === 0) {
    return Array.from({ length: count }, () => "40%");
  }

  const padded = [...slice];
  while (padded.length < count) {
    padded.unshift(padded[0] ?? 0);
  }

  const min = Math.min(...padded);
  const max = Math.max(...padded);
  const range = max - min || 1;

  return padded.map((v) => {
    const t = (v - min) / range;
    const pct = minPct + t * (maxPct - minPct);
    return `${Math.round(pct)}%`;
  });
}
