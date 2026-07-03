"use client";

import { CsvDownloadButton } from "@/components/CsvDownloadButton";
import { PdfDownloadButton } from "@/components/PdfDownloadButton";
import { buildDashboardCsv } from "@/lib/export/buildDashboardCsv";
import { buildDashboardPdfBase64 } from "@/lib/export/buildDashboardPdf";
import type { DashboardReportData } from "@/lib/export/dashboardReport";

export function DashboardExport({ report }: { report: DashboardReportData }) {
  const stamp = report.generatedAt.toISOString().slice(0, 10);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <PdfDownloadButton
        label="PDF"
        filename={`gridpulse-dashboard-${stamp}.pdf`}
        exportFn={() => buildDashboardPdfBase64(report)}
      />
      <CsvDownloadButton
        label="CSV"
        filename={`gridpulse-dashboard-${stamp}.csv`}
        exportFn={async () => buildDashboardCsv(report)}
      />
    </div>
  );
}
