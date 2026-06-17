import fs from 'node:fs';
import path from 'node:path';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';
type LogDriver = 'console' | 'file' | 'sentry';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const LOG_DIR = path.join(process.cwd(), 'logs');

const currentLevel: LogLevel = (process.env.LOG_LEVEL as LogLevel) || 'info';
const driver: LogDriver = (process.env.LOG_DRIVER as LogDriver) || 'file';

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
  } catch {}
}

function logConsole(level: LogLevel, source: string, message: string, data?: unknown) {
  const formatted = formatMessage(level, source, message, data);
  const fn = level === 'error' ? console.error
    : level === 'warn' ? console.warn
    : console.log;
  fn(formatted);
}

function logFile(level: LogLevel, source: string, message: string, data?: unknown) {
  if (!isServer) return;

  const formatted = formatMessage(level, source, message, data);
  const date = dateStamp();

  writeToFile(`app-${date}.log`, formatted);
  if (level === 'error') {
    writeToFile(`error-${date}.log`, formatted);
  }
}

function logSentry(level: LogLevel, _source: string, message: string, data?: unknown) {
  try {
    const Sentry = require('@sentry/nextjs');
    const severity = level === 'debug' ? 'debug'
      : level === 'info' ? 'info'
      : level === 'warn' ? 'warning'
      : 'error';

    Sentry.captureMessage(message, {
      level: severity,
      extra: data,
    });
  } catch {
    logConsole(level, 'sentry', message, data);
  }
}

function log(level: LogLevel, source: string, message: string, data?: unknown) {
  if (LOG_LEVELS[level] < LOG_LEVELS[currentLevel]) return;

  switch (driver) {
    case 'console':
      logConsole(level, source, message, data);
      break;
    case 'file':
      logFile(level, source, message, data);
      break;
    case 'sentry':
      logSentry(level, source, message, data);
      break;
  }
}

interface Logger {
  debug: (message: string, data?: unknown) => void;
  info: (message: string, data?: unknown) => void;
  warn: (message: string, data?: unknown) => void;
  error: (message: string, data?: unknown) => void;
}

export function logger(source: string): Logger {
  return {
    debug: (message, data) => log('debug', source, message, data),
    info: (message, data) => log('info', source, message, data),
    warn: (message, data) => log('warn', source, message, data),
    error: (message, data) => log('error', source, message, data),
  };
}

export const logDebug = (source: string, message: string, data?: unknown) =>
  log('debug', source, message, data);
export const logInfo = (source: string, message: string, data?: unknown) =>
  log('info', source, message, data);
export const logWarn = (source: string, message: string, data?: unknown) =>
  log('warn', source, message, data);
export const logError = (source: string, message: string, data?: unknown) =>
  log('error', source, message, data);
