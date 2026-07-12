export type TourApp = "portfolio" | "gridpulse" | "flexslot" | "greenops";

export type TourStepDef = {
  id: string;
  app: TourApp;
  path: string;
  element: string;
  title: string;
  description: string;
  progress: number;
  side?: "top" | "bottom" | "left" | "right";
};

export const TOUR_DISMISS_KEY = "meridian-tour-dismissed";

export const TOUR_STEPS: TourStepDef[] = [
  {
    id: "pf-intro",
    app: "portfolio",
    path: "/meridian",
    element: '[data-tour="demo-launch"]',
    title: "Parcours Meridian",
    description:
      "Visite guidée en 7 étapes : data GridPulse → décision FlexSlot → action GreenOps. Idéal en visio sans narrer chaque clic.",
    progress: 1,
    side: "bottom",
  },
  {
    id: "gp-journey",
    app: "gridpulse",
    path: "/dashboard",
    element: '[data-tour="journey-bar"]',
    title: "GridPulse — Data",
    description:
      "La barre de parcours relie les 3 apps. Ici vous êtes sur la brique « data » : mix RTE et intensité carbone.",
    progress: 2,
    side: "bottom",
  },
  {
    id: "gp-kpis",
    app: "gridpulse",
    path: "/dashboard",
    element: '[data-tour="dashboard-kpis"]',
    title: "KPI réseau",
    description:
      "Intensité carbone, part renouvelable et consommation — signaux pour décider quand flexibiliser.",
    progress: 3,
    side: "bottom",
  },
  {
    id: "gp-green",
    app: "gridpulse",
    path: "/dashboard",
    element: '[data-tour="green-window"]',
    title: "Créneaux verts",
    description:
      "Fenêtre favorable sur 6 h — c’est ce signal que FlexSlot transforme en recommandation actionnable.",
    progress: 4,
    side: "top",
  },
  {
    id: "fs-reco",
    app: "flexslot",
    path: "/recommendations",
    element: '[data-tour="reco-hero"]',
    title: "FlexSlot — Décision",
    description:
      "Recommandation principale : consommer, flexibiliser ou décaler selon le score GridPulse.",
    progress: 5,
    side: "bottom",
  },
  {
    id: "fs-create",
    app: "flexslot",
    path: "/recommendations",
    element: '[data-tour="create-slot"]',
    title: "Créer le slot",
    description:
      "Un clic envoie le créneau dans GreenOps (API service-to-service). Cliquez si vous voulez matérialiser l’action, puis Suivant.",
    progress: 6,
    side: "top",
  },
  {
    id: "go-flex",
    app: "greenops",
    path: "/flex",
    element: '[data-tour="flex-slots"]',
    title: "GreenOps — Action",
    description:
      "Le slot créé apparaît ici avec la source FlexSlot. C’est la preuve de la chaîne data → décision → ops.",
    progress: 7,
    side: "bottom",
  },
];

const STEP_MAP = new Map(TOUR_STEPS.map((step) => [step.id, step]));

export function getStep(id: string): TourStepDef | undefined {
  return STEP_MAP.get(id);
}

export function getNextStep(id: string): TourStepDef | undefined {
  const index = TOUR_STEPS.findIndex((step) => step.id === id);
  if (index < 0 || index >= TOUR_STEPS.length - 1) return undefined;
  return TOUR_STEPS[index + 1];
}

const APP_BASE_URLS: Record<Exclude<TourApp, "portfolio">, string> = {
  gridpulse:
    process.env.NEXT_PUBLIC_GRIDPULSE_DEMO_URL?.trim() ||
    "https://grid-pulse-steel.vercel.app",
  flexslot:
    process.env.NEXT_PUBLIC_FLEXSLOT_DEMO_URL?.trim() ||
    "https://flex-slot.vercel.app",
  greenops:
    process.env.NEXT_PUBLIC_GREENOPS_DEMO_URL?.trim() ||
    "https://green-ops-five.vercel.app",
};

export function buildTourHref(app: TourApp, stepId: string): string {
  const step = getStep(stepId);
  if (!step) return "/";

  if (app === "portfolio") {
    return `/meridian?tour=1&step=${stepId}`;
  }

  const base = APP_BASE_URLS[app].replace(/\/$/, "");
  const url = new URL(`${base}${step.path}`);
  url.searchParams.set("tour", "1");
  url.searchParams.set("step", stepId);
  return url.toString();
}

export function resolveTourNavigation(
  currentStepId: string,
): string | null {
  const next = getNextStep(currentStepId);
  if (!next) return null;
  return buildTourHref(next.app, next.id);
}
