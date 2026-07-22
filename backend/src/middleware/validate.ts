/**
 * ============================================================================
 * QUESTIFY MIDDLEWARE: Alternate Validator
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * An alternate validation parser helper.
 * 
 * WHY IT EXISTS:
 * Provides flexible query/param validation helpers.
 * 
 * HOW IT WORKS (Technical Overview):
 * Checks query parameters against schema specifications.
 * ============================================================================
 *
 * NOTE: This uses a different validation library (express-validator) than
 * the rest of the app, which validates with Zod via middleware/validation.ts.
 * No route currently imports this file — it is not wired into the running server.
 */

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
