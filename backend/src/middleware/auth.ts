import { Response, NextFunction } from "express";
import { verifyAccessToken } from "@/utils/jwt";
import { AuthorizationError } from "@/utils/errors";
import type { AuthenticatedRequest, UserRole } from "@/types";

export function protect(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({
      success: false,
      error: { code: "UNAUTHORIZED", message: "Not authenticated. Please log in." },
      timestamp: new Date().toISOString(),
    });
    return;
  }

  try {
    const token = header.split(" ")[1];
    const decoded = verifyAccessToken(token);
    req.user = { id: decoded.id, role: decoded.role, name: decoded.name };
    next();
  } catch (err) {
    // verifyAccessToken throws AuthenticationError or TokenExpiredError
    next(err);
  }
}

export function authorize(...roles: UserRole[]) {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      next(
        new AuthorizationError(
          `Access denied. Required role: ${roles.join(" or ")}.`
        )
      );
      return;
    }
    next();
  };
}
