import type { BrowserOptions, EdgeOptions, NodeOptions } from "@sentry/nextjs";

const DEFAULT_SAMPLE_RATE = 0.1;

export function getSentryDsn(): string | undefined {
  return process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN;
}

export function isSentryEnabled(): boolean {
  return Boolean(getSentryDsn()) && process.env.NODE_ENV === "production";
}

export function getSentryEnvironment(): string {
  return (
    process.env.SENTRY_ENVIRONMENT ??
    process.env.VERCEL_ENV ??
    process.env.NODE_ENV ??
    "development"
  );
}

export function getSentryBaseOptions(
  service: string,
): NodeOptions & EdgeOptions & BrowserOptions {
  return {
    dsn: getSentryDsn(),
    enabled: isSentryEnabled(),
    environment: getSentryEnvironment(),
    tracesSampleRate: DEFAULT_SAMPLE_RATE,
    initialScope: {
      tags: { service },
    },
  };
}
