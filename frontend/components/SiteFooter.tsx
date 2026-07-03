import { GridPulseLogo } from "@/components/GridPulseLogo";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="app-footer mt-auto">
      <div className="app-footer-inner mx-auto flex max-w-5xl flex-col items-center px-4 py-8 text-center">
        <GridPulseLogo size="sm" showWordmark />
        <p className="mx-auto mt-3 max-w-sm text-sm text-muted">
          Mix électrique &amp; intensité carbone — démo data portfolio
        </p>
        <p className="mt-4 text-xs text-muted">
          Sources RTE · Electricity Maps · {year}
        </p>
      </div>
    </footer>
  );
}
