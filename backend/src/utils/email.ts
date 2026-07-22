/**
 * ============================================================================
 * QUESTIFY UTILITY: Mock Email Handler
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * A placeholder helper to log alerts instead of sending emails, as email notifications
 * are disabled.
 * 
 * WHY IT EXISTS:
 * Adheres to system constraints: enrollment, profile changes, and resets remain silent.
 * 
 * HOW IT WORKS (Technical Overview):
 * Stub function printing logs instead of executing SMTP request dispatches.
 * ============================================================================
 */

import nodemailer, { type Transporter } from "nodemailer";
import { env } from "@/config/environment";

export interface CredentialEmailPayload {
  to:           string;
  name:         string;
  tempPassword: string;
  loginUrl:     string;
  role:         string;
}

export interface EmailResult {
  sent:   boolean;
  error?: string;
}

// ── Transport factory ──────────────────────────────────────────────────────────
// Sets up the connection to an outgoing mail server (SMTP), using settings
// from the environment. If those settings aren't configured, returns null so
// the caller can fall back to just logging the email instead of sending it.
function buildTransport(): Transporter | null {
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) return null;

  return nodemailer.createTransport({
    host:   env.SMTP_HOST,
    port:   env.SMTP_PORT ?? 587,
    secure: env.SMTP_SECURE,
    auth:   { user: env.SMTP_USER, pass: env.SMTP_PASS },
  });
}

// ── HTML template ──────────────────────────────────────────────────────────────
// Builds the actual email message a new user receives: a welcome note with
// their login email, temporary password, and a button to log in.
function buildHtml(name: string, email: string, password: string, loginUrl: string, role: string): string {
  const roleLabel = role.charAt(0).toUpperCase() + role.slice(1);
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Your Questify Account</title></head>
<body style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#1D2226">
  <h2 style="color:#0A66C2">Welcome to Questify, ${name}!</h2>
  <p>An administrator has created a <strong>${roleLabel}</strong> account for you.</p>
  <table style="background:#F3F2EE;border-radius:8px;padding:16px 24px;margin:16px 0;border-collapse:collapse">
    <tr>
      <td style="padding:6px 0;font-weight:600">Email</td>
      <td style="padding:6px 16px">${email}</td>
    </tr>
    <tr>
      <td style="padding:6px 0;font-weight:600">Temporary&nbsp;Password</td>
      <td style="padding:6px 16px;font-family:monospace;font-size:20px;letter-spacing:3px;color:#0A66C2">${password}</td>
    </tr>
  </table>
  <p>
    <a href="${loginUrl}"
       style="background:#0A66C2;color:#fff;padding:12px 24px;text-decoration:none;border-radius:4px;display:inline-block;font-weight:600">
      Log in to Questify →
    </a>
  </p>
  <p style="color:#666;font-size:13px">
    Please change your password after your first login.
    This temporary password will remain valid until changed.
  </p>
  <hr style="border:none;border-top:1px solid #E0DFDC;margin:24px 0">
  <p style="color:#999;font-size:12px">
    If you did not expect this message, please ignore it or contact your administrator.
  </p>
</body>
</html>`;
}

// ── Public send function ───────────────────────────────────────────────────────
// Sends the "here's your new account" email to a newly created user.
// Never throws — returns { sent: false, error } on failure so callers can
// log a warning without blocking the user creation response.
export async function sendCredentialEmail(payload: CredentialEmailPayload): Promise<EmailResult> {
  const transport = buildTransport();

  if (!transport) {
    // Dev fallback: write to stdout so developers can read the password
    console.log(
      JSON.stringify({
        event:        "EMAIL_SKIPPED_NO_SMTP",
        to:           payload.to,
        name:         payload.name,
        role:         payload.role,
        tempPassword: payload.tempPassword,
        loginUrl:     payload.loginUrl,
        hint:         "Set SMTP_HOST, SMTP_USER, SMTP_PASS to send real emails",
        timestamp:    new Date().toISOString(),
      }, null, 2)
    );
    return { sent: false, error: "SMTP not configured — credentials printed to server log" };
  }

  try {
    await transport.sendMail({
      from:    `"Questify" <${env.SMTP_FROM}>`,
      to:      payload.to,
      subject: "Your Questify Account Credentials",
      html:    buildHtml(payload.name, payload.to, payload.tempPassword, payload.loginUrl, payload.role),
    });
    return { sent: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(JSON.stringify({ event: "EMAIL_SEND_FAILED", to: payload.to, error: message }));
    return { sent: false, error: message };
  }
}

// ── Enrollment notification payloads ──────────────────────────────────────────
export interface EnrollmentEmailPayload {
  to:         string;
  name:       string;
  courseName: string;
  semester?:  string;
  loginUrl:   string;
}

// ── Enrollment HTML templates ──────────────────────────────────────────────────
// Builds the email message telling a student they've been enrolled in a course.
function buildEnrollmentHtml(name: string, courseName: string, semester?: string): string {
  const semesterRow = semester
    ? `<tr><td style="padding:6px 0;font-weight:600">Semester</td><td style="padding:6px 16px">${semester}</td></tr>`
    : "";
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Enrolled in ${courseName}</title></head>
<body style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#1D2226">
  <h2 style="color:#0A66C2">You've been enrolled in a course, ${name}!</h2>
  <p>An administrator has enrolled you in the following course on Questify.</p>
  <table style="background:#F3F2EE;border-radius:8px;padding:16px 24px;margin:16px 0;border-collapse:collapse">
    <tr>
      <td style="padding:6px 0;font-weight:600">Course</td>
      <td style="padding:6px 16px;font-weight:600;color:#0A66C2">${courseName}</td>
    </tr>
    ${semesterRow}
  </table>
  <p>Log in to Questify to access your course materials and get started.</p>
  <hr style="border:none;border-top:1px solid #E0DFDC;margin:24px 0">
  <p style="color:#999;font-size:12px">If you have any questions, please contact your administrator.</p>
</body>
</html>`;
}

// Builds the email message telling a student they've been removed from a course.
function buildUnenrollmentHtml(name: string, courseName: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Removed from ${courseName}</title></head>
<body style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#1D2226">
  <h2 style="color:#E03131">Course Enrollment Dropped</h2>
  <p>Hi ${name},</p>
  <p>An administrator has removed your enrollment from <strong>${courseName}</strong>.</p>
  <p style="color:#666;font-size:13px">
    If you believe this was done in error, please contact your administrator.
  </p>
  <hr style="border:none;border-top:1px solid #E0DFDC;margin:24px 0">
  <p style="color:#999;font-size:12px">This is an automated notification from Questify.</p>
</body>
</html>`;
}

// Builds the email message telling a student their enrollment status changed
// (e.g. moved from "Active" to "Completed" or "Dropped").
function buildStatusChangeHtml(name: string, courseName: string, newStatus: string): string {
  const statusColors: Record<string, string> = {
    ACTIVE:    "#2F9E44",
    COMPLETED: "#0A66C2",
    DROPPED:   "#E03131",
  };
  const color = statusColors[newStatus] ?? "#1D2226";
  const statusLabel = newStatus.charAt(0) + newStatus.slice(1).toLowerCase();
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Enrollment Status Update</title></head>
<body style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#1D2226">
  <h2 style="color:#0A66C2">Enrollment Status Updated</h2>
  <p>Hi ${name},</p>
  <p>Your enrollment status in <strong>${courseName}</strong> has been updated.</p>
  <table style="background:#F3F2EE;border-radius:8px;padding:16px 24px;margin:16px 0;border-collapse:collapse">
    <tr>
      <td style="padding:6px 0;font-weight:600">New Status</td>
      <td style="padding:6px 16px;font-weight:600;color:${color}">${statusLabel}</td>
    </tr>
  </table>
  <p style="color:#666;font-size:13px">
    If you have questions about this change, please contact your administrator.
  </p>
  <hr style="border:none;border-top:1px solid #E0DFDC;margin:24px 0">
  <p style="color:#999;font-size:12px">This is an automated notification from Questify.</p>
</body>
</html>`;
}

// ── Enrollment send functions ───────────────────────────────────────────────────
// Sends the "you've been enrolled" notification email to a student.
export async function sendEnrollmentEmail(payload: EnrollmentEmailPayload): Promise<EmailResult> {
  const transport = buildTransport();

  if (!transport) {
    console.log(
      JSON.stringify({
        event:      "EMAIL_SKIPPED_NO_SMTP",
        type:       "ENROLLMENT",
        to:         payload.to,
        courseName: payload.courseName,
        semester:   payload.semester,
        hint:       "Set SMTP_HOST, SMTP_USER, SMTP_PASS to send real emails",
        timestamp:  new Date().toISOString(),
      }, null, 2)
    );
    return { sent: false, error: "SMTP not configured" };
  }

  try {
    await transport.sendMail({
      from:    `"Questify" <${env.SMTP_FROM}>`,
      to:      payload.to,
      subject: `You've been enrolled in ${payload.courseName}`,
      html:    buildEnrollmentHtml(payload.name, payload.courseName, payload.semester),
    });
    return { sent: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(JSON.stringify({ event: "EMAIL_SEND_FAILED", type: "ENROLLMENT", to: payload.to, error: message }));
    return { sent: false, error: message };
  }
}

// Sends the "you've been removed from this course" notification email.
export async function sendUnenrollmentEmail(
  to: string,
  name: string,
  courseName: string
): Promise<EmailResult> {
  const transport = buildTransport();

  if (!transport) {
    console.log(JSON.stringify({ event: "EMAIL_SKIPPED_NO_SMTP", type: "UNENROLLMENT", to, courseName, timestamp: new Date().toISOString() }));
    return { sent: false, error: "SMTP not configured" };
  }

  try {
    await transport.sendMail({
      from:    `"Questify" <${env.SMTP_FROM}>`,
      to,
      subject: `Your enrollment in ${courseName} has been dropped`,
      html:    buildUnenrollmentHtml(name, courseName),
    });
    return { sent: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(JSON.stringify({ event: "EMAIL_SEND_FAILED", type: "UNENROLLMENT", to, error: message }));
    return { sent: false, error: message };
  }
}

// Sends the "your enrollment status changed" notification email.
export async function sendEnrollmentStatusEmail(
  to: string,
  name: string,
  courseName: string,
  newStatus: string
): Promise<EmailResult> {
  const transport = buildTransport();

  if (!transport) {
    console.log(JSON.stringify({ event: "EMAIL_SKIPPED_NO_SMTP", type: "STATUS_CHANGE", to, courseName, newStatus, timestamp: new Date().toISOString() }));
    return { sent: false, error: "SMTP not configured" };
  }

  try {
    await transport.sendMail({
      from:    `"Questify" <${env.SMTP_FROM}>`,
      to,
      subject: `Enrollment status update: ${courseName}`,
      html:    buildStatusChangeHtml(name, courseName, newStatus),
    });
    return { sent: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(JSON.stringify({ event: "EMAIL_SEND_FAILED", type: "STATUS_CHANGE", to, error: message }));
    return { sent: false, error: message };
  }
}

// ── Password reset variant ─────────────────────────────────────────────────────
// Reuses the new-account email template to send someone their reset password.
export async function sendPasswordResetEmail(
  to: string,
  name: string,
  tempPassword: string,
  loginUrl: string
): Promise<EmailResult> {
  return sendCredentialEmail({ to, name, tempPassword, loginUrl, role: "password reset" });
}
