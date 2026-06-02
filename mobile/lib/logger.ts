type Level = "trace" | "debug" | "info" | "warn" | "error" | "fatal";

interface Logger {
  trace: (obj: object, msg?: string) => void;
  debug: (obj: object, msg?: string) => void;
  info:  (obj: object, msg?: string) => void;
  warn:  (obj: object, msg?: string) => void;
  error: (obj: object, msg?: string) => void;
  fatal: (obj: object, msg?: string) => void;
  child: (bindings: object) => Logger;
}

function makeLogger(bindings: object = {}): Logger {
  const fmt = (level: Level, obj: object, msg?: string) => {
    const line = { ...bindings, ...obj, ...(msg ? { msg } : {}) };
    switch (level) {
      case "trace":
      case "debug": return console.debug(`[${level}]`, line);
      case "info":  return console.info(`[${level}]`,  line);
      case "warn":  return console.warn(`[${level}]`,  line);
      case "error":
      case "fatal": return console.error(`[${level}]`, line);
    }
  };
  return {
    trace: (o, m) => fmt("trace", o, m),
    debug: (o, m) => fmt("debug", o, m),
    info:  (o, m) => fmt("info",  o, m),
    warn:  (o, m) => fmt("warn",  o, m),
    error: (o, m) => fmt("error", o, m),
    fatal: (o, m) => fmt("fatal", o, m),
    child: (extra) => makeLogger({ ...bindings, ...extra }),
  };
}

export default makeLogger();
