const noop = () => {};
const logger = { info: noop, error: noop, warn: noop, debug: noop, trace: noop, fatal: noop, child: () => logger };
export default function pino() {
  return logger;
}
