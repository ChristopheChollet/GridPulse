"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <span className="btn-ghost h-9 w-9" aria-hidden />;
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      className="btn-ghost h-9 w-9"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Mode clair" : "Mode sombre"}
    >
      {isDark ? "☀" : "☾"}
    </button>
  );
}
