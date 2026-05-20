import { appendFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { supabaseAdmin } from './supabase.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_LOG_DIR = path.resolve(__dirname, '..', 'logs');
const LOG_DIR = process.env.AUDIT_LOG_DIR
  ? path.resolve(process.env.AUDIT_LOG_DIR)
  : DEFAULT_LOG_DIR;

const SENSITIVE_KEYS = new Set([
  'authorization',
  'access_token',
  'refresh_token',
  'token',
  'password',
  'new_password',
  'confirm_password',
  'secret',
  'apikey',
  'api_key',
]);

function todayFileName(date = new Date()) {
  return `audit-${date.toISOString().slice(0, 10)}.log`;
}

function shouldRedact(key) {
  return SENSITIVE_KEYS.has(String(key).toLowerCase());
}

export function sanitizeValue(value, depth = 0) {
  if (value == null) return value;
  if (depth > 4) return '[MaxDepth]';
  if (Buffer.isBuffer(value)) return `[Buffer ${value.length} bytes]`;
  if (Array.isArray(value)) return value.slice(0, 20).map((item) => sanitizeValue(item, depth + 1));
  if (typeof value !== 'object') return value;

  return Object.fromEntries(
    Object.entries(value)
      .slice(0, 80)
      .map(([key, item]) => [
        key,
        shouldRedact(key) ? '[Redacted]' : sanitizeValue(item, depth + 1),
      ])
  );
}

function normalizeError(error) {
  if (!error) return undefined;
  return {
    name: error.name,
    message: error.message,
    code: error.code,
    status: error.status,
  };
}

function shouldWriteFile() {
  if (process.env.AUDIT_LOG_TO_FILE === 'true') return true;
  if (process.env.AUDIT_LOG_TO_FILE === 'false') return false;
  return !process.env.VERCEL;
}

function shouldWriteDatabase() {
  if (process.env.AUDIT_LOG_TO_DB === 'false') return false;
  return Boolean(process.env.VITE_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

async function writeAuditFile(entry) {
  await mkdir(LOG_DIR, { recursive: true });
  await appendFile(path.join(LOG_DIR, todayFileName()), `${JSON.stringify(entry)}\n`, 'utf8');
}

async function writeAuditDatabase(entry) {
  const payload = {
    created_at: entry.timestamp,
    event_type: entry.type ?? null,
    action: entry.action ?? null,
    outcome: entry.outcome ?? null,
    request_id: entry.requestId ?? null,
    actor_id: entry.actor?.id ?? null,
    actor_email: entry.actor?.email ?? null,
    actor_role: entry.actor?.role ?? null,
    method: entry.request?.method ?? null,
    path: entry.request?.path ?? null,
    route: entry.request?.route ?? null,
    status: entry.response?.status ?? null,
    duration_ms: entry.response?.durationMs ?? null,
    ip: entry.request?.ip ?? null,
    user_agent: entry.request?.userAgent ?? null,
    request: entry.request ?? {},
    response: entry.response ?? {},
    details: entry.details ?? {},
    error: entry.error ?? null,
    raw_event: entry,
  };

  const { error } = await supabaseAdmin.from('audit_logs').insert(payload);
  if (error) throw error;
}

function logAuditFailure(destination, error) {
  console.error(`Failed to write audit log to ${destination}`, normalizeError(error));
}

export async function writeAuditLog(event) {
  const entry = {
    timestamp: new Date().toISOString(),
    ...sanitizeValue(event),
  };

  const writes = [];
  if (shouldWriteFile()) {
    writes.push(writeAuditFile(entry).catch((error) => logAuditFailure('file', error)));
  }
  if (shouldWriteDatabase()) {
    writes.push(writeAuditDatabase(entry).catch((error) => logAuditFailure('database', error)));
  }
  if (process.env.AUDIT_LOG_TO_CONSOLE === 'true') {
    console.log(JSON.stringify(entry));
  }

  await Promise.all(writes);
}

export function auditEvent(req, action, details = {}) {
  return writeAuditLog({
    type: 'event',
    action,
    requestId: req?.requestId,
    actor: {
      id: req?.user?.id ?? details.actorId ?? null,
      email: req?.user?.email ?? details.actorEmail ?? null,
      role: req?.userRole ?? null,
    },
    request: req
      ? {
          method: req.method,
          path: req.originalUrl,
          ip: req.ip,
          userAgent: req.get('user-agent') ?? null,
        }
      : undefined,
    details,
  });
}

export function auditError(req, action, error, details = {}) {
  return writeAuditLog({
    type: 'error',
    action,
    requestId: req?.requestId,
    actor: {
      id: req?.user?.id ?? null,
      email: req?.user?.email ?? null,
      role: req?.userRole ?? null,
    },
    request: req
      ? {
          method: req.method,
          path: req.originalUrl,
          ip: req.ip,
          userAgent: req.get('user-agent') ?? null,
        }
      : undefined,
    error: normalizeError(error),
    details,
  });
}
