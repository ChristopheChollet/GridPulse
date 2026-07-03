import type { DashboardReportData } from "./dashboardReport";

function fmtTime(iso: string | null | undefined): string {
  if (!iso) return "";
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "Europe/Paris",
  }).format(new Date(iso));
}

function escapeCell(value: string | number | null | undefined): string {
  const text = value == null ? "" : String(value);
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function row(cells: (string | number | null | undefined)[]): string {
  return cells.map(escapeCell).join(",");
}

export function buildDashboardCsv(data: DashboardReportData): string {
  const lines: string[] = [];
  const { summary, mixPoints, carbonPoints, greenWindows } = data;

  lines.push("GridPulse — export dashboard");
  lines.push(row(["Genere le", data.generatedAt.toISOString()]));
  lines.push("");

  lines.push("Indicateurs actuels");
  lines.push(row(["Intensite carbone gCO2/kWh", summary.carbon_gco2_kwh]));
  lines.push(row(["Carbone enregistre le", fmtTime(summary.carbon_recorded_at)]));
  lines.push(row(["Part renouvelable %", summary.renewable_pct]));
  lines.push(row(["Mix enregistre le", fmtTime(summary.mix_recorded_at)]));
  lines.push(row(["Consommation MW", summary.consumption_mw]));
  lines.push("");

  if (greenWindows.best_window) {
    const w = greenWindows.best_window;
    lines.push(`Meilleure fenetre ${greenWindows.window_hours} h`);
    lines.push(row(["Debut", fmtTime(w.start_at)]));
    lines.push(row(["Fin", fmtTime(w.end_at)]));
    lines.push(row(["Carbone moyen gCO2/kWh", w.avg_carbon_gco2_kwh]));
    lines.push(row(["Renouvelable moyen %", w.avg_renewable_pct]));
    lines.push(row(["Score", w.score]));
    lines.push("");
  }

  lines.push("Historique carbone (24 h)");
  lines.push(row(["recorded_at", "carbon_gco2_kwh", "fossil_fuel_pct"]));
  for (const p of carbonPoints) {
    lines.push(row([p.recorded_at, p.carbon_gco2_kwh, p.fossil_fuel_pct]));
  }
  lines.push("");

  lines.push("Historique mix (24 h)");
  lines.push(
    row([
      "recorded_at",
      "nuclear_pct",
      "wind_pct",
      "solar_pct",
      "hydro_pct",
      "gas_pct",
      "coal_pct",
      "other_pct",
      "consumption_mw",
    ]),
  );
  for (const p of mixPoints) {
    lines.push(
      row([
        p.recorded_at,
        p.nuclear_pct,
        p.wind_pct,
        p.solar_pct,
        p.hydro_pct,
        p.gas_pct,
        p.coal_pct,
        p.other_pct,
        p.consumption_mw,
      ]),
    );
  }

  return lines.join("\n");
}
