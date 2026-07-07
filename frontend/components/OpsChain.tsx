type OpsChainHighlight = "data" | "decision" | "action";

type OpsChainProps = {
  highlight: OpsChainHighlight;
  links: {
    gridPulse?: string;
    flexSlot?: string;
    greenOps?: string;
  };
};

const steps = [
  {
    id: "data" as const,
    label: "1 · Data",
    name: "GridPulse",
    description: "Mix, carbone, green-windows",
    linkKey: "gridPulse" as const,
  },
  {
    id: "decision" as const,
    label: "2 · Décision",
    name: "FlexSlot",
    description: "Consommer · flex · décaler",
    linkKey: "flexSlot" as const,
  },
  {
    id: "action" as const,
    label: "3 · Action",
    name: "GreenOps",
    description: "flex_slots, audit, équipe",
    linkKey: "greenOps" as const,
  },
];

export function OpsChain({ highlight, links }: OpsChainProps) {
  return (
    <section className="ops-chain-section" aria-labelledby="ops-chain-heading">
      <p className="ops-chain-eyebrow">Écosystème</p>
      <h2 id="ops-chain-heading" className="ops-chain-title">
        Chaîne ops
      </h2>
      <p className="ops-chain-lead">
        Trois services indépendants — data, décision, action — reliés par de vraies API.
      </p>
      <div className="ops-chain-grid">
        {steps.map((step, index) => {
          const demoUrl = links[step.linkKey];
          const isCurrent = step.id === highlight;

          return (
            <div key={step.id} className="contents">
              {index > 0 ? (
                <span className="ops-chain-arrow hidden sm:block" aria-hidden>
                  →
                </span>
              ) : null}
              <div
                className={`ops-chain-step${isCurrent ? " ops-chain-step-current" : ""}`}
              >
                <p className="ops-chain-step-label">{step.label}</p>
                <p className="ops-chain-step-name">{step.name}</p>
                <p className="ops-chain-step-desc">{step.description}</p>
                {demoUrl && !isCurrent ? (
                  <a
                    href={demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ops-chain-demo-link"
                  >
                    Démo →
                  </a>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
