/**
 * ============================================================================
 * QUESTIFY MIDDLEWARE: Request Input Validator
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * Checks incoming form details against expected data requirements.
 * 
 * WHY IT EXISTS:
 * Rejects invalid form formats immediately.
 * 
 * HOW IT WORKS (Technical Overview):
 * Validates request bodies, params, or query parameters.
 * ============================================================================
 */

import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { ValidationError } from "@/utils/errors";

type RequestTarget = "body" | "params" | "query";

// Turns Zod's technical error output into a plain list of readable messages
// like "email: Invalid email address", one per problem found.
function formatZodError(err: ZodError): string[] {
  return err.issues.map((issue) => {
    const path = issue.path.length > 0 ? `${issue.path.join(".")}: ` : "";
    return `${path}${issue.message}`;
  });
}

/**
 * validateRequest — validates req[target] against a Zod schema.
 * On success, replaces req[target] with the parsed (coerced) data.
 * On failure, passes a ValidationError to next().
 *
 * @example
 * router.post("/login", validateRequest(loginSchema), loginController);
 * router.get("/:id",    validateRequest(idSchema, "params"), getById);
 */
export function validateRequest(schema: ZodSchema, target: RequestTarget = "body") {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target]);

    if (result.success) {
      // Overwrite with Zod-parsed data so coercions and defaults are applied
      (req as unknown as Record<string, unknown>)[target] = result.data;
      next();
      return;
    }

    next(new ValidationError("Validation failed", formatZodError(result.error)));
  };
}

/**
 * validateBody — shorthand for validateRequest(schema, "body").
 */
export const validateBody = (schema: ZodSchema) => validateRequest(schema, "body");

/**
 * validateParams — shorthand for validateRequest(schema, "params").
 */
export const validateParams = (schema: ZodSchema) => validateRequest(schema, "params");

/**
 * validateQuery — shorthand for validateRequest(schema, "query").
 */
export const validateQuery = (schema: ZodSchema) => validateRequest(schema, "query");
