import Link from "next/link";
import { HeroLivePreview } from "@/components/HeroLivePreview";
import { getRepoUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

const features = [
  {
    accent: "#059669",
    title: "Pipeline data",
    description:
      "FastAPI ingère le mix RTE (open data ODRE) et l'intensité carbone Electricity Maps vers Supabase, toutes les heures.",
  },
  {
    accent: "#0891b2",
    title: "Dashboard temps réel",
    description:
      "KPIs, courbe carbone 24 h et mix empilé — lecture publique, sans auth, déployé pour la démo portfolio.",
  },
  {
    accent: "#7c3aed",
    title: "Prévision baseline",
    description:
      "Moyenne mobile 24 h sur l'intensité carbone — modèle pédagogique, assumé comme baseline et non opérationnel RTE.",
  },
];

const stack = [
  "Next.js",
  "FastAPI",
  "Python",
  "Supabase",
  "PostgreSQL",
  "recharts",
  "Vercel",
];

export default function HomePage() {
  const repoUrl = getRepoUrl();

  return (
    <div className="pb-16">
      <section className="landing-hero-split pb-16 pt-4 sm:pt-8">
        <div className="landing-hero-copy motion-fade-up">
          <p className="landing-eyebrow">Data engineer · Énergie &amp; climat</p>
          <h1 className="landing-title">
            Mix électrique
            <br />
            <span className="landing-title-accent">&amp; carbone FR</span>
          </h1>
          <p className="landing-lead">
            GridPulse agrège RTE et Electricity Maps : ingestion horaire, historique
            en base, KPIs et graphiques — le complément data de GreenOps, sans
            blockchain.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/dashboard" className="btn-primary px-6 py-2.5 text-sm">
              Ouvrir le dashboard
            </Link>
            <a
              href={repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost px-6 py-2.5 text-sm"
            >
              Code source →
            </a>
          </div>
          <ul className="stack-pills mt-8">
            {stack.map((item) => (
              <li key={item} className="stack-pill">
                {item}
              </li>
            ))}
          </ul>
        </div>
        <HeroLivePreview />
      </section>

      <section className="motion-fade-up motion-stagger-2" aria-labelledby="features-heading">
        <p className="text-xs font-medium uppercase tracking-widest text-muted">Modules</p>
        <h2 id="features-heading" className="mt-2 text-xl font-semibold text-primary">
          Pipeline, visualisation, prévision
        </h2>
        <ul className="feature-grid mt-8">
          {features.map((f) => (
            <li key={f.title} className="feature-card">
              <span
                className="feature-card-icon"
                style={{ color: f.accent, backgroundColor: `${f.accent}14` }}
                aria-hidden
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M4 18 L8 12 L12 15 L16 8 L20 11"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <h3 className="feature-card-title">{f.title}</h3>
              <p className="feature-card-desc">{f.description}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
