import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import createError from 'http-errors';

export function validate(schema: ZodSchema, target: 'body' | 'query' | 'params' = 'body') {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[target]);
    if (!result.success) {
      const fields: Record<string, string[]> = {};
      (result.error as ZodError).errors.forEach((e) => {
        const key = e.path.join('.');
        fields[key] = fields[key] ?? [];
        fields[key].push(e.message);
      });
      return next(
        createError(400, 'Validation error', {
          code: 'VALIDATION_ERROR',
          fields,
        })
      );
    }
    req[target] = result.data;
    next();
  };
}
