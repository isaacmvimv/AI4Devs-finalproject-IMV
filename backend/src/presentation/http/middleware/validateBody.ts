import type { NextFunction, Request, Response } from 'express'
import type { ZodIssue, ZodSchema } from 'zod'
import { ValidationError } from '../../../domain/errors/appErrors'

function mapZodIssues(issues: ZodIssue[]): Array<{ field: string; message: string }> {
  return issues.map((issue) => ({
    field: issue.path.join('.') || 'input',
    message: issue.message,
  }))
}

export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body)
    if (!result.success) {
      return next(new ValidationError('Datos inválidos', mapZodIssues(result.error.issues)))
    }
    req.body = result.data
    next()
  }
}
