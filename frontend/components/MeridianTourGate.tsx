"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import {
  TOUR_STEPS,
  getStep,
  resolveTourNavigation,
  type TourApp,
} from "@/lib/meridian-tour/config";

export function MeridianTourGate({ app }: { app: TourApp }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const hasRun = useRef(false);
  const [fallbackHref, setFallbackHref] = useState<string | null>(null);

  useEffect(() => {
    hasRun.current = false;
    setFallbackHref(null);
  }, [searchParams, pathname]);

  useEffect(() => {
    if (searchParams.get("tour") !== "1") return;

    const stepId =
      searchParams.get("step") ??
      TOUR_STEPS.find((step) => step.app === app)?.id;
    if (!stepId) return;

    const step = getStep(stepId);
    if (!step || step.app !== app) return;
    if (!pathname.startsWith(step.path)) return;

    const nextHref = resolveTourNavigation(step.id);
    const isLast = !nextHref;

    let attempts = 0;
    const maxAttempts = 60;

    const timer = window.setInterval(() => {
      attempts += 1;
      const element = document.querySelector(step.element);

      if (!element) {
        if (attempts >= maxAttempts) {
          window.clearInterval(timer);
          if (nextHref) setFallbackHref(nextHref);
        }
        return;
      }

      if (hasRun.current) {
        window.clearInterval(timer);
        return;
      }
      hasRun.current = true;
      window.clearInterval(timer);

      const popover = {
        title: step.title,
        description: step.description,
        side: step.side ?? "bottom",
        align: "start" as const,
      };

      // driver.js shows "Terminer" on a single-step tour — add a placeholder
      // step so the primary button stays "Suivant →" until we navigate away.
      const steps = isLast
        ? [{ element: step.element, popover }]
        : [
            { element: step.element, popover },
            {
              element: step.element,
              popover: {
                title: "Étape suivante",
                description: "Ouverture de l'application suivante…",
              },
            },
          ];

      const driverObj = driver({
        showProgress: true,
        progressText: `${step.progress} / ${TOUR_STEPS.length}`,
        allowClose: true,
        overlayClickBehavior: "close",
        nextBtnText: "Suivant →",
        doneBtnText: "Terminer",
        showButtons: isLast ? ["close"] : ["next", "close"],
        onPopoverRender: (popoverDom) => {
          if (popoverDom.progress) {
            popoverDom.progress.textContent = `${step.progress} / ${TOUR_STEPS.length}`;
          }
          if (!isLast && popoverDom.nextButton) {
            popoverDom.nextButton.textContent = "Suivant →";
          }
        },
        onNextClick: () => {
          driverObj.destroy();
          if (nextHref) {
            window.location.href = nextHref;
          }
        },
        onCloseClick: () => {
          driverObj.destroy();
        },
        steps,
      });

      driverObj.drive();
    }, 200);

    return () => window.clearInterval(timer);
  }, [app, pathname, searchParams]);

  if (!fallbackHref) return null;

  return (
    <div className="tour-fallback-banner" role="status">
      <p>
        Étape suivante introuvable sur cette page — l&apos;app n&apos;est peut-être pas
        encore déployée avec le tour.{" "}
        <a href={fallbackHref} className="tour-fallback-link">
          Continuer le parcours →
        </a>
      </p>
    </div>
  );
}
