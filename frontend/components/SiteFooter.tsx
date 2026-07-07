import { GridPulseLogo } from "@/components/GridPulseLogo";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="app-footer mt-auto">
      <div className="app-footer-inner mx-auto flex max-w-5xl flex-col items-center px-4 py-8 text-center">
        <GridPulseLogo size="sm" showWordmark />
        <p className="mt-4 text-xs text-muted">
          Christophe Chollet · {year}
        </p>
      </div>
    </footer>
  );
}
