import { formatTime, getSummary } from "@/lib/api";

export async function HeroLivePreview() {
  let summary = null;
  try {
    summary = await getSummary();
  } catch {
    return <HeroPreviewPlaceholder />;
  }

  const hasData =
    summary.carbon_gco2_kwh != null || summary.renewable_pct != null;

  if (!hasData) {
    return <HeroPreviewPlaceholder />;
  }

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
          <div className="hero-preview-bar" style={{ height: "45%" }} />
          <div className="hero-preview-bar" style={{ height: "70%" }} />
          <div className="hero-preview-bar" style={{ height: "55%" }} />
          <div className="hero-preview-bar" style={{ height: "85%" }} />
          <div className="hero-preview-bar" style={{ height: "60%" }} />
          <div className="hero-preview-bar" style={{ height: "40%" }} />
        </div>
        <p className="hero-preview-foot text-xs text-muted">
          Données live · {formatTime(summary.carbon_recorded_at ?? summary.mix_recorded_at)}
        </p>
      </div>
    </div>
  );
}

function HeroPreviewPlaceholder() {
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
      </div>
    </div>
  );
}
