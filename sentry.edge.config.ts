const sentryEdgeConfig = {
  dsn: process.env.SENTRY_DSN ?? "",
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
};

export default sentryEdgeConfig;
