import type { CarbonPoint, GreenWindows, MixPoint, Summary } from "@/lib/api";

export type DashboardReportData = {
  generatedAt: Date;
  summary: Summary;
  mixPoints: MixPoint[];
  carbonPoints: CarbonPoint[];
  greenWindows: GreenWindows;
};
