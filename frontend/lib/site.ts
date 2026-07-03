const REPO_URL =
  process.env.NEXT_PUBLIC_GRIDPULSE_REPO_URL ??
  "https://github.com/ChristopheChollet/GridPulse";

export function getRepoUrl(): string {
  return REPO_URL;
}
