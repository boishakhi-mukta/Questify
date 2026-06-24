import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";

/**
 * Reads the result of preceding express-validator chains and
 * short-circuits the request with a 422 if any field fails.
 *
 * Usage:
 *   router.post("/", [...validationRules], validate, controller)
 */
export function validate(req: Request, res: Response, next: NextFunction): void {
  const result = validationResult(req);
  if (result.isEmpty()) {
    next();
    return;
  }

  res.status(422).json({
    success: false,
    message: "Validation failed",
    errors: result.array().map((e) => e.msg as string),
  });
}
