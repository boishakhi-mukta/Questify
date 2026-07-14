/**
 * ============================================================================
 * QUESTIFY TYPES: Authentication Interfaces
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * Sets structural rules for user credential properties.
 * 
 * WHY IT EXISTS:
 * Guides developers during user data extraction tasks.
 * 
 * HOW IT WORKS (Technical Overview):
 * Exports TypeScript schemas defining credential models.
 * ============================================================================
 */

export type UserRole = "admin" | "teacher" | "student";

export interface AuthUser {
  _id:                    string;
  email:                  string;
  firstName:              string;
  lastName:               string;
  fullName:               string;
  role:                   UserRole;
  avatar?:                string;
  isActive:               boolean;
  requiresPasswordChange: boolean;
  lastLogin?:             string;
  createdAt:              string;
}

export interface LoginResponse {
  accessToken:             string;
  refreshToken:            string;
  expiresIn:               string;
  user:                    AuthUser;
  requiresPasswordChange:  boolean;
}

export interface LoginResult {
  success:                true;
  requiresPasswordChange: boolean;
}

export interface LoginError {
  success: false;
  error:   string;
}
