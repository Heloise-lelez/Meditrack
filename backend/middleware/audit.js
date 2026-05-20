import crypto from 'node:crypto';
import { writeAuditLog, sanitizeValue } from '../lib/auditLogger.js';

function getFileMetadata(req) {
  if (!req.file) return undefined;
  return {
    fieldName: req.file.fieldname,
    originalName: req.file.originalname,
    mimeType: req.file.mimetype,
    size: req.file.size,
  };
}

function getBodySummary(req) {
  if (!req.body || typeof req.body !== 'object') return undefined;

  return {
    keys: Object.keys(req.body),
  };
}

export function auditRequestLogger(req, res, next) {
  const startedAt = process.hrtime.bigint();
  req.requestId = crypto.randomUUID();

  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
    const status = res.statusCode;

    void writeAuditLog({
      type: 'request',
      requestId: req.requestId,
      outcome: status >= 400 ? 'error' : 'success',
      actor: {
        id: req.user?.id ?? null,
        email: req.user?.email ?? null,
        role: req.userRole ?? null,
      },
      request: {
        method: req.method,
        path: req.originalUrl,
        route: req.route?.path ?? null,
        params: sanitizeValue(req.params ?? {}),
        query: sanitizeValue(req.query ?? {}),
        ip: req.ip,
        userAgent: req.get('user-agent') ?? null,
        referer: req.get('referer') ?? null,
      },
      response: {
        status,
        durationMs: Math.round(durationMs),
      },
      body: getBodySummary(req),
      file: getFileMetadata(req),
    });
  });

  next();
}
