import { formatTime, getCarbon, getSummary } from "@/lib/api";
import { valuesToBarHeightPcts } from "@/lib/chartBarHeights";

const DEMO_BAR_VALUES = [42, 38, 35, 48, 40, 36];

export async function HeroLivePreview() {
  let summary = null;
  let carbonPoints: { carbon_gco2_kwh: number }[] = [];

  try {
    const [summaryResult, carbonResult] = await Promise.all([
      getSummary(),
      getCarbon(8),
    ]);
    summary = summaryResult;
    carbonPoints = carbonResult.points ?? [];
  } catch {
    return <HeroPreviewPlaceholder />;
  }

  const hasData =
    summary.carbon_gco2_kwh != null || summary.renewable_pct != null;

  if (!hasData) {
    return <HeroPreviewPlaceholder />;
  }

  const barValues =
    carbonPoints.length > 0
      ? carbonPoints.slice(-6).map((p) => p.carbon_gco2_kwh)
      : DEMO_BAR_VALUES;

  const barHeights = valuesToBarHeightPcts(barValues);

  return (
    <div className="screenshot-frame motion-fade-up motion-stagger-2">
      <div className="screenshot-frame-chrome">
        <span className="screenshot-frame-dot" />
        <span className="screenshot-frame-dot" />
        <span className="screenshot-frame-dot" />
        <span className="ml-2 text-xs text-muted">gridpulse — live</span>
      </div>
      <div className="hero-preview-body">
        <div className="hero-preview-stats">
          <div className="hero-preview-stat">
            <p className="hero-preview-label">Carbone</p>
            <p className="hero-preview-value">
              {summary.carbon_gco2_kwh != null
                ? `${summary.carbon_gco2_kwh} g`
                : "—"}
            </p>
          </div>
          <div className="hero-preview-stat">
            <p className="hero-preview-label">Renouvelable</p>
            <p className="hero-preview-value hero-preview-value-ok">
              {summary.renewable_pct != null ? `${summary.renewable_pct} %` : "—"}
            </p>
          </div>
          <div className="hero-preview-stat">
            <p className="hero-preview-label">Conso FR</p>
            <p className="hero-preview-value">
              {summary.consumption_mw != null
                ? `${Math.round(summary.consumption_mw / 1000)} GW`
                : "—"}
            </p>
          </div>
        </div>
        <div className="hero-preview-chart" aria-hidden>
          {barHeights.map((height, i) => (
            <div key={i} className="hero-preview-bar" style={{ height }} />
          ))}
        </div>
        <p className="hero-preview-foot text-xs text-muted">
          Données live · {formatTime(summary.carbon_recorded_at ?? summary.mix_recorded_at)}
          <span className="block mt-1">Intensité carbone (6 dernières heures)</span>
        </p>
      </div>
    </div>
  );
}

function HeroPreviewPlaceholder() {
  const barHeights = valuesToBarHeightPcts(DEMO_BAR_VALUES);

  return (
    <div className="screenshot-frame motion-fade-up motion-stagger-2">
      <div className="screenshot-frame-chrome">
        <span className="screenshot-frame-dot" />
        <span className="screenshot-frame-dot" />
        <span className="screenshot-frame-dot" />
      </div>
      <div className="hero-preview-body hero-preview-body-muted">
        <p className="text-sm text-secondary">Aperçu tableau de bord</p>
        <p className="mt-2 text-xs text-muted">
          KPIs carbone, mix et prévision — données RTE &amp; Electricity Maps
        </p>
        <div className="hero-preview-chart mt-4" aria-hidden>
          {barHeights.map((height, i) => (
            <div key={i} className="hero-preview-bar" style={{ height }} />
          ))}
        </div>
      </div>
    </div>
  );
}
