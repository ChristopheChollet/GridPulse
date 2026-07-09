import Link from "next/link";
import { HeroLivePreview } from "@/components/HeroLivePreview";
import {
  DashboardIcon,
  ForecastIcon,
  StatusIcon,
} from "@/components/ModuleIcons";
import { OpsChain } from "@/components/OpsChain";
import { getEcosystemLinks, getRepoUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

const features = [
  {
    accent: "#0891b2",
    href: "/dashboard",
    title: "Tableau de bord",
    icon: DashboardIcon,
    description:
      "KPIs, courbe carbone 24 h, mix empilé, créneau vert 6 h et export PDF/CSV — lecture publique, prototype non réglementaire.",
  },
  {
    accent: "#7c3aed",
    href: "/forecast",
    title: "Prévision",
    icon: ForecastIcon,
    description:
      "Moyenne mobile 24 h sur l'intensité carbone — modèle pédagogique, assumé comme baseline et non opérationnel RTE.",
  },
  {
    accent: "#d97706",
    href: "/status",
    title: "Statut",
    icon: StatusIcon,
    description:
      "Observabilité du pipeline : ingest RTE + Electricity Maps, volumes en base, dernière sync et erreurs — cron horaire côté backend.",
  },
] as const;

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
  const ecosystem = getEcosystemLinks();

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
            GridPulse agrège RTE et Electricity Maps : ingestion horaire, tableau de bord,
            créneaux verts, exports et statut pipeline — le complément data de
            GreenOps, sans blockchain.
          </p>
          <div className="landing-hero-cta">
            <Link href="/dashboard" className="btn-primary px-6 py-2.5 text-sm">
              Ouvrir le tableau de bord
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
          <ul className="stack-pills">
            {stack.map((item) => (
              <li key={item} className="stack-pill">
                {item}
              </li>
            ))}
          </ul>
        </div>
        <HeroLivePreview />
      </section>

      <OpsChain
        highlight="data"
        links={{
          flexSlot: ecosystem.flexSlot,
          greenOps: ecosystem.greenOps,
        }}
      />

      <section className="landing-modules motion-fade-up motion-stagger-2" aria-labelledby="features-heading">
        <p className="text-xs font-medium uppercase tracking-widest text-muted">Modules</p>
        <h2 id="features-heading" className="mt-2 text-xl font-semibold text-primary">
          Les pages du produit
        </h2>
        <p className="landing-modules-lead">
          Même entrées que la navigation — le pipeline data (FastAPI + cron) n&apos;a
          pas de page dédiée : il se pilote et s&apos;observe via Statut.
        </p>
        <ul className="feature-grid">
          {features.map((f) => {
            const Icon = f.icon;
            return (
            <li key={f.title}>
              <Link href={f.href} className="feature-card feature-card-link">
                <span
                  className="feature-card-icon"
                  style={{ color: f.accent, backgroundColor: `${f.accent}14` }}
                  aria-hidden
                >
                  <Icon />
                </span>
                <h3 className="feature-card-title">{f.title}</h3>
                <p className="feature-card-desc">{f.description}</p>
              </Link>
            </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
