import { getEcosystemLinks } from "@/lib/site";

type StepId = "gridpulse" | "flexslot" | "greenops";

const STEP_ORDER: { id: StepId; label: string; name: string }[] = [
  { id: "gridpulse", label: "Data", name: "GridPulse" },
  { id: "flexslot", label: "Décision", name: "FlexSlot" },
  { id: "greenops", label: "Action", name: "GreenOps" },
];

export function MeridianJourneyBar({ current }: { current: StepId }) {
  const { flexSlot, greenOps } = getEcosystemLinks();
  const hrefFor: Record<StepId, string | null> = {
    gridpulse: null,
    flexslot: flexSlot,
    greenops: greenOps,
  };

  return (
    <nav className="journey-bar" aria-label="Parcours Meridian">
      <ol className="journey-bar-list">
        {STEP_ORDER.map((step, index) => {
          const isCurrent = step.id === current;
          const href = hrefFor[step.id];
          return (
            <li key={step.id} className="journey-bar-item">
              {index > 0 ? (
                <span className="journey-bar-sep" aria-hidden>
                  →
                </span>
              ) : null}
              {isCurrent || !href ? (
                <span
                  className={`journey-bar-step${isCurrent ? " journey-bar-step-current" : ""}`}
                  aria-current={isCurrent ? "step" : undefined}
                >
                  <span className="journey-bar-step-label">{step.label}</span>
                  <span className="journey-bar-step-name">{step.name}</span>
                </span>
              ) : (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="journey-bar-step journey-bar-step-link"
                >
                  <span className="journey-bar-step-label">{step.label}</span>
                  <span className="journey-bar-step-name">{step.name} ↗</span>
                </a>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
