/**
 * ============================================================================
 * QUESTIFY UTILITY: Async Handler
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * Prevents server crashes by catching unexpected issues in background actions.
 * 
 * WHY IT EXISTS:
 * Automates error-catching, so developers don't have to write try/catch blocks repeatedly.
 * 
 * HOW IT WORKS (Technical Overview):
 * Wraps express routers inside custom functions that forward errors to the global error middleware.
 * ============================================================================
 */

import { Request, Response, NextFunction } from "express";

type AsyncFn = (req: Request, res: Response, next: NextFunction) => Promise<void>;

// Wraps a route handler so that if it throws an error (e.g. a failed database
// lookup), that error is automatically passed along to the app's central
// error handler instead of crashing the server or getting silently lost.
export const asyncHandler = (fn: AsyncFn) =>
  (req: Request, res: Response, next: NextFunction): void => {
    fn(req, res, next).catch(next);
  };
