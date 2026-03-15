import { Request, Response, NextFunction } from 'express';
import { HttpError } from 'http-errors';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  const httpError = err as HttpError & { code?: string; fields?: Record<string, string[]> };
  const status = httpError.status ?? 500;
  const code = httpError.code ?? (status === 500 ? 'INTERNAL_ERROR' : 'ERROR');
  const message = status === 500 ? 'Internal server error' : err.message;

  if (status === 500) {
    console.error(err);
  }

  res.status(status).json({
    success: false,
    error: {
      code,
      message,
      ...(httpError.fields ? { fields: httpError.fields } : {}),
    },
  });
}
