/**
 * ============================================================================
 * QUESTIFY UTILITY: AppError Base Class
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * The foundational builder class for generating customizable backend error objects.
 * 
 * WHY IT EXISTS:
 * Standardizes how errors are created, caught, and reported globally.
 * 
 * HOW IT WORKS (Technical Overview):
 * Extends the default Error object, attaching isOperational flags and code metadata.
 * ============================================================================
 */

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}
