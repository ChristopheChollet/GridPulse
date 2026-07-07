import Link from "next/link";
import { GridPulseLogo } from "@/components/GridPulseLogo";
import { NavLinks } from "@/components/NavLinks";
import { ThemeToggle } from "@/components/ThemeToggle";
import { glassHeaderStyle } from "@/lib/glassHeaderStyle";

export function SiteHeader() {
  return (
    <header className="site-header" style={glassHeaderStyle} role="banner">
      <div className="site-header-bar mx-auto flex max-w-5xl items-center justify-between gap-4 px-4">
        <Link href="/" className="brand-lockup">
          <GridPulseLogo size="md" />
          <span className="brand-lockup-text">
            <span className="brand-lockup-name">GridPulse</span>
            <span className="brand-lockup-sub">Data énergie</span>
          </span>
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          <NavLinks />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
