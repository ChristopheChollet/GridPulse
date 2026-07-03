import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { DashboardReportData } from "./dashboardReport";

const PAGE_W = 595;
const PAGE_H = 842;
const MARGIN = 50;
const LINE = 14;

function fmtTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "Europe/Paris",
  }).format(new Date(iso));
}

function truncate(text: string, max: number): string {
  return text.length <= max ? text : `${text.slice(0, max - 1)}…`;
}

export async function buildDashboardPdf(data: DashboardReportData): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const accent = rgb(0.016, 0.471, 0.341);
  const muted = rgb(0.45, 0.45, 0.45);

  let page = pdf.addPage([PAGE_W, PAGE_H]);
  let y = PAGE_H - MARGIN;

  const ensureSpace = (needed: number) => {
    if (y - needed >= MARGIN) return;
    page = pdf.addPage([PAGE_W, PAGE_H]);
    y = PAGE_H - MARGIN;
  };

  const drawLine = (
    text: string,
    opts?: { bold?: boolean; size?: number; color?: ReturnType<typeof rgb> },
  ) => {
    const size = opts?.size ?? 10;
    ensureSpace(LINE + 4);
    page.drawText(text, {
      x: MARGIN,
      y,
      size,
      font: opts?.bold ? fontBold : font,
      color: opts?.color ?? rgb(0.1, 0.1, 0.1),
    });
    y -= LINE + (opts?.size && opts.size > 11 ? 4 : 0);
  };

  page.drawText("GridPulse", {
    x: MARGIN,
    y,
    size: 20,
    font: fontBold,
    color: accent,
  });
  y -= 26;

  drawLine("Rapport energie — France", { bold: true, size: 14 });
  y -= 4;
  drawLine(
    `Genere le ${data.generatedAt.toLocaleString("fr-FR")} — demo portfolio, non reglementaire`,
    { size: 9, color: muted },
  );
  y -= 8;

  const { summary, greenWindows } = data;

  drawLine("Indicateurs actuels", { bold: true, size: 12 });
  drawLine(
    `Intensite carbone : ${
      summary.carbon_gco2_kwh != null ? `${summary.carbon_gco2_kwh} gCO2/kWh` : "—"
    } (${fmtTime(summary.carbon_recorded_at)})`,
  );
  drawLine(
    `Part renouvelable : ${
      summary.renewable_pct != null ? `${summary.renewable_pct} %` : "—"
    } (${fmtTime(summary.mix_recorded_at)})`,
  );
  drawLine(
    `Consommation : ${
      summary.consumption_mw != null
        ? `${Math.round(summary.consumption_mw).toLocaleString("fr-FR")} MW`
        : "—"
    }`,
  );
  y -= 8;

  if (greenWindows.best_window) {
    const w = greenWindows.best_window;
    drawLine(`Meilleure fenetre ${greenWindows.window_hours} h`, { bold: true, size: 12 });
    drawLine(`De ${fmtTime(w.start_at)} a ${fmtTime(w.end_at)}`);
    drawLine(
      `Carbone moyen ${w.avg_carbon_gco2_kwh} gCO2/kWh — renouvelable ${w.avg_renewable_pct} %`,
    );
    y -= 8;
  }

  drawLine("Historique carbone (extrait)", { bold: true, size: 12 });
  for (const p of data.carbonPoints.slice(-12)) {
    drawLine(
      `${fmtTime(p.recorded_at)} — ${p.carbon_gco2_kwh} gCO2/kWh`,
      { size: 9 },
    );
  }
  y -= 4;

  drawLine("Historique mix (extrait)", { bold: true, size: 12 });
  for (const p of data.mixPoints.slice(-8)) {
    const ren =
      Number(p.wind_pct) + Number(p.solar_pct) + Number(p.hydro_pct);
    drawLine(
      truncate(
        `${fmtTime(p.recorded_at)} — ren. ${ren.toFixed(0)} % — nucl. ${p.nuclear_pct} %`,
        90,
      ),
      { size: 9 },
    );
  }

  return pdf.save();
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return btoa(binary);
}

export async function buildDashboardPdfBase64(data: DashboardReportData): Promise<string> {
  const bytes = await buildDashboardPdf(data);
  return bytesToBase64(bytes);
}
