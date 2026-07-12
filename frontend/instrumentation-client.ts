import * as Sentry from "@sentry/nextjs";
import { getSentryBaseOptions } from "./lib/sentry/options";

Sentry.init(getSentryBaseOptions("gridpulse-frontend"));
