import fs from 'node:fs';
import path from 'node:path';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const LOG_DIR = path.join(process.cwd(), 'logs');

const currentLevel: LogLevel = (process.env.LOG_LEVEL as LogLevel) || 'info';

const isServer = typeof window === 'undefined';

function ensureDir() {
  if (!isServer) return;
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}

function dateStamp() {
  return new Date().toISOString().slice(0, 10);
}

function timestamp() {
  return new Date().toISOString();
}

function formatMessage(level: LogLevel, source: string, message: string, data?: unknown): string {
  const dataStr = data !== undefined ? ` ${JSON.stringify(data)}` : '';
  return `${timestamp()} [${level.toUpperCase()}] [${source}] ${message}${dataStr}`;
}

function writeToFile(fileName: string, line: string) {
  try {
    ensureDir();
    fs.appendFileSync(path.join(LOG_DIR, fileName), line + '\n');
  } catch {
    // fail silently — don't let logging cause errors
  }
}

function log(level: LogLevel, source: string, message: string, data?: unknown) {
  if (LOG_LEVELS[level] < LOG_LEVELS[currentLevel]) return;

  const formatted = formatMessage(level, source, message, data);

  // Always write to console with color
  const consoleFn =
    level === 'error'
      ? console.error
      : level === 'warn'
        ? console.warn
        : level === 'debug'
          ? console.debug
          : console.log;
  consoleFn(formatted);

  // File logging only on the server
  if (!isServer) return;

  const date = dateStamp();
  if (level === 'error') {
    writeToFile(`error-${date}.log`, formatted);
  }
  writeToFile(`app-${date}.log`, formatted);
}

function getSource(filePath?: string): string {
  if (!filePath) return 'unknown';
  // Extract a meaningful short name from the file path
  const relative = filePath.includes('/app/')
    ? filePath.slice(filePath.indexOf('/app/') + 5)
    : filePath.includes('/lib/')
      ? filePath.slice(filePath.indexOf('/lib/') + 5)
      : filePath.includes('/scripts/')
        ? filePath.slice(filePath.indexOf('/scripts/') + 9)
        : filePath;
  return relative.replace(/\.(ts|tsx)$/, '');
}

interface Logger {
  debug: (message: string, data?: unknown) => void;
  info: (message: string, data?: unknown) => void;
  warn: (message: string, data?: unknown) => void;
  error: (message: string, data?: unknown) => void;
}

/**
 * Create a logger instance scoped to a source file.
 *
 * Usage:
 *   const log = logger('checkout/page');
 *   log.error('Payment failed', { orderId: 123 });
 *   log.info('Order placed successfully');
 */
export function logger(source: string): Logger {
  return {
    debug: (message, data) => log('debug', source, message, data),
    info: (message, data) => log('info', source, message, data),
    warn: (message, data) => log('warn', source, message, data),
    error: (message, data) => log('error', source, message, data),
  };
}

// Convenience exports for direct use
export const logDebug = (source: string, message: string, data?: unknown) =>
  log('debug', source, message, data);
export const logInfo = (source: string, message: string, data?: unknown) =>
  log('info', source, message, data);
export const logWarn = (source: string, message: string, data?: unknown) =>
  log('warn', source, message, data);
export const logError = (source: string, message: string, data?: unknown) =>
  log('error', source, message, data);
