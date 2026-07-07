const REPO_URL =
  process.env.NEXT_PUBLIC_GRIDPULSE_REPO_URL ??
  "https://github.com/ChristopheChollet/GridPulse";

export function getRepoUrl(): string {
  return REPO_URL;
}

export function getEcosystemLinks() {
  return {
    flexSlot:
      process.env.NEXT_PUBLIC_FLEXSLOT_DEMO_URL?.trim() ||
      "https://flex-slot.vercel.app",
    greenOps:
      process.env.NEXT_PUBLIC_GREENOPS_DEMO_URL?.trim() ||
      "https://green-ops-five.vercel.app",
  };
}
