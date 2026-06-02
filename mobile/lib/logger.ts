import pino from "pino";

// Default level: debug — change to "info" or "warn" to reduce noise in prod
const logger = pino({
  level: "debug",
  browser: {
    asObject: true,
    write: {
      trace: (o: object) => console.debug("[trace]", o),
      debug: (o: object) => console.debug("[debug]", o),
      info:  (o: object) => console.info("[info]",  o),
      warn:  (o: object) => console.warn("[warn]",  o),
      error: (o: object) => console.error("[error]", o),
      fatal: (o: object) => console.error("[fatal]", o),
    },
  },
});

export default logger;
