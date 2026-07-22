"use client";

/**
 * ============================================================================
 * QUESTIFY PAGE ROUTE: Student Assignment Detail & Uploads
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * The page where a student views homework instructions and submits solutions.
 * 
 * WHY IT EXISTS:
 * Entry point for homework submissions.
 * 
 * HOW IT WORKS (Technical Overview):
 * Inspects courseId/assignmentId URL parameters, loading instructions and form states.
 * ============================================================================
 */

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardContent,
  ProgressBar,
  ProgressBarTrack,
  ProgressBarFill,
  Chip,
  Skeleton,
  Alert,
  AlertIndicator,
  AlertContent,
  AlertTitle,
  AlertDescription,
  TextArea,
  Input,
} from "@heroui/react";
import {
  HiArrowLeft,
  HiCheckCircle,
  HiExclamationTriangle,
  HiInformationCircle,
  HiClock,
  HiStar,
  HiCalendar,
  HiPaperClip,
  HiLink,
  HiCodeBracket,
  HiDocumentText,
  HiArrowUpTray,
  HiXMark,
} from "react-icons/hi2";
import { Button } from "@/components/ui/button";
import { useCourseAssignments } from "@/hooks/api/useCourseAssignments";
import type { Assignment, SubmissionType } from "@/types/api-response";
import { cn } from "@/lib/utils";

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Turns a raw date string into a long, friendly format (e.g. "Fri, June 12, 2026").
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "short",
    month:   "long",
    day:     "numeric",
    year:    "numeric",
  });
}

// Same idea, but shorter and including the time (used for "submitted at" timestamps).
function formatDateShort(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month:  "short",
    day:    "numeric",
    year:   "numeric",
    hour:   "numeric",
    minute: "2-digit",
  });
}

type DueStatus = "overdue" | "due-soon" | "upcoming";

// Works out whether an assignment's due date has already passed, is coming
// up within 3 days, or is still further away.
function getDueStatus(dueDate: string): DueStatus {
  const diff = (new Date(dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
  if (diff < 0)  return "overdue";
  if (diff <= 3) return "due-soon";
  return "upcoming";
}

const DUE_STATUS_LABEL: Record<DueStatus, string> = {
  "overdue":  "Overdue",
  "due-soon": "Due Soon",
  "upcoming": "Upcoming",
};

const SUBMISSION_TYPE_ICON: Record<SubmissionType, React.ElementType> = {
  TEXT: HiDocumentText,
  FILE: HiPaperClip,
  LINK: HiLink,
  CODE: HiCodeBracket,
};

// ─── Divider ──────────────────────────────────────────────────────────────────

// A thin horizontal separator line.
function Divider({ className }: { className?: string }) {
  return <div className={cn("h-px bg-brand-border", className)} />;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

// A grey placeholder layout shown while the assignment's details are still loading.
function PageSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-5 w-28 rounded-lg" />
      <Card className="bg-white">
        <CardContent className="flex flex-col gap-4 pt-4">
          <Skeleton className="h-7 w-2/3 rounded-lg" />
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col gap-2">
                <Skeleton className="h-3 w-16 rounded-lg" />
                <Skeleton className="h-5 w-24 rounded-lg" />
              </div>
            ))}
          </div>
          <Skeleton className="h-20 w-full rounded-lg" />
        </CardContent>
      </Card>
      <Card className="bg-white">
        <CardContent className="flex flex-col gap-4 pt-4">
          <Skeleton className="h-5 w-40 rounded-lg" />
          <Skeleton className="h-32 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-md" />
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Assignment detail card ───────────────────────────────────────────────────

// The read-only card at the top showing the assignment's title, due date,
// points, description, instructions, and any attachments.
function AssignmentDetailCard({ assignment }: { assignment: Assignment }) {
  const dueStatus = getDueStatus(assignment.dueDate);
  const TypeIcon  = SUBMISSION_TYPE_ICON[assignment.submissionType];

  const chipColor = {
    overdue:  "danger",
    "due-soon": "warning",
    upcoming: "success",
  }[dueStatus] as "danger" | "warning" | "success";

  return (
    <Card className="bg-white">
      <CardHeader className="pb-1">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 flex-wrap">
            <Chip size="sm" className="text-xs bg-brand-bg text-brand-body border-none">
              <span className="flex items-center gap-1">
                <TypeIcon size={11} />
                {assignment.submissionType.toLowerCase()} submission
              </span>
            </Chip>
            <Chip size="sm" color={chipColor} variant="soft" className="text-xs">
              {DUE_STATUS_LABEL[dueStatus]}
            </Chip>
            {!assignment.allowLateSubmission && (
              <Chip size="sm" className="text-xs bg-red-50 text-red-600 border-red-200">
                No late submissions
              </Chip>
            )}
          </div>
          <h1 className="text-2xl font-bold text-brand-dark mt-1">
            {assignment.title}
          </h1>
        </div>
      </CardHeader>

      <Divider />

      <CardContent className="flex flex-col gap-5 pt-4">
        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div>
            <p className="text-[13px] font-medium text-brand-body uppercase tracking-wide mb-1">
              Due Date
            </p>
            <p className="flex items-center gap-1.5 text-[15px] font-semibold text-brand-dark">
              <HiCalendar size={14} className="text-brand-body shrink-0" />
              {formatDate(assignment.dueDate)}
            </p>
          </div>
          <div>
            <p className="text-[13px] font-medium text-brand-body uppercase tracking-wide mb-1">
              Points
            </p>
            <p className="flex items-center gap-1.5 text-[15px] font-semibold text-brand-dark">
              <HiStar size={14} className="text-amber-500 shrink-0" />
              {assignment.totalPoints} XP
            </p>
          </div>
          {assignment.latePenalty > 0 && (
            <div>
              <p className="text-[13px] font-medium text-brand-body uppercase tracking-wide mb-1">
                Late Penalty
              </p>
              <p className="text-[15px] font-semibold text-red-600">
                −{assignment.latePenalty}% per day
              </p>
            </div>
          )}
        </div>

        {/* Description */}
        <div>
          <p className="text-[13px] font-medium text-brand-body uppercase tracking-wide mb-2">
            Description
          </p>
          <p className="text-[15px] text-brand-dark leading-relaxed whitespace-pre-wrap">
            {assignment.description}
          </p>
        </div>

        {/* Instructions */}
        {assignment.instructions && (
          <div>
            <p className="text-[13px] font-medium text-brand-body uppercase tracking-wide mb-2">
              Instructions
            </p>
            <div className="rounded-md bg-brand-blue-light border border-brand-blue/20 p-4 text-sm text-brand-dark leading-relaxed whitespace-pre-wrap">
              {assignment.instructions}
            </div>
          </div>
        )}

        {/* Attachments */}
        {assignment.attachments.length > 0 && (
          <div>
            <p className="text-[13px] font-medium text-brand-body uppercase tracking-wide mb-2">
              Attachments
            </p>
            <div className="flex flex-col gap-2">
              {assignment.attachments.map((url, i) => (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-brand-blue hover:text-brand-blue-dark font-medium transition-colors"
                >
                  <HiPaperClip size={14} />
                  {url.split("/").pop() ?? `Attachment ${i + 1}`}
                </a>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Submission form ──────────────────────────────────────────────────────────

interface SubmissionFormProps {
  assignment:   Assignment;
  courseId:     string;
  onSubmitted:  (submittedAt: string) => void;
  submit:       (payload: {
    assignmentId: string;
    courseId:     string;
    submissionContent?: string;
    fileUrl?:     string;
  }) => Promise<{ submittedAt: string }>;
}

// The form a student fills in to turn in their work — its fields change
// based on the assignment's submission type (text, code, link, or file URL).
function SubmissionForm({
  assignment,
  courseId,
  onSubmitted,
  submit,
}: SubmissionFormProps) {
  const [text,          setText]          = useState("");
  const [linkUrl,       setLinkUrl]       = useState("");
  const [isSubmitting,  setIsSubmitting]  = useState(false);
  const [submitError,   setSubmitError]   = useState<string | null>(null);
  const [progress,      setProgress]      = useState(0);

  const submissionType = assignment.submissionType;
  const maxChars = 10_000;

  const isOverdue = getDueStatus(assignment.dueDate) === "overdue";
  const canSubmit = isOverdue ? assignment.allowLateSubmission : true;

  const isValid = useMemo(() => {
    if (submissionType === "TEXT" || submissionType === "CODE") {
      return text.trim().length > 0 && text.length <= maxChars;
    }
    if (submissionType === "FILE" || submissionType === "LINK") {
      return linkUrl.trim().length > 0;
    }
    return false;
  }, [submissionType, text, linkUrl, maxChars]);

  // Sends the student's work to the server, showing a fake progress bar
  // while it's in flight, then reports success (or an error) back up.
  async function handleSubmit() {
    if (!isValid || isSubmitting) return;
    setSubmitError(null);
    setIsSubmitting(true);
    setProgress(0);

    // Simulate submission progress
    const tick = setInterval(() => {
      setProgress((p) => Math.min(p + 20, 85));
    }, 200);

    try {
      const result = await submit({
        assignmentId:      assignment._id,
        courseId,
        submissionContent: submissionType === "TEXT" || submissionType === "CODE" ? text.trim() : undefined,
        fileUrl:           submissionType === "FILE" || submissionType === "LINK" ? linkUrl.trim() : undefined,
      });
      clearInterval(tick);
      setProgress(100);
      setTimeout(() => onSubmitted(result.submittedAt), 300);
    } catch (err) {
      clearInterval(tick);
      setProgress(0);
      setSubmitError(
        err instanceof Error ? err.message : "Failed to submit. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="bg-white">
      <CardHeader className="pb-1">
        <p className="text-[19px] font-bold text-brand-dark">Submit Assignment</p>
      </CardHeader>
      <Divider />
      <CardContent className="flex flex-col gap-6 pt-4">

        {/* Overdue / no late submission warning */}
        {isOverdue && !canSubmit && (
          <Alert status="danger">
            <AlertIndicator>
              <HiExclamationTriangle size={16} />
            </AlertIndicator>
            <AlertContent>
              <AlertTitle>Submission Closed</AlertTitle>
              <AlertDescription>
                The due date has passed and this assignment does not accept late submissions.
              </AlertDescription>
            </AlertContent>
          </Alert>
        )}

        {isOverdue && canSubmit && (
          <Alert status="warning">
            <AlertIndicator>
              <HiClock size={16} />
            </AlertIndicator>
            <AlertContent>
              <AlertTitle>Late Submission</AlertTitle>
              <AlertDescription>
                This is past the due date. A penalty of {assignment.latePenalty}% per day will be applied.
              </AlertDescription>
            </AlertContent>
          </Alert>
        )}

        {/* Submission input — conditioned on type */}
        {(submissionType === "TEXT" || submissionType === "CODE") && (
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-brand-body uppercase tracking-wide">
              {submissionType === "CODE" ? "Your Code" : "Your Response"}
            </label>
            <TextArea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={
                submissionType === "CODE"
                  ? "// Paste your code here"
                  : "Write your response here…"
              }
              rows={submissionType === "CODE" ? 14 : 8}
              disabled={!canSubmit || isSubmitting}
              className={cn(
                "w-full resize-y rounded-md border border-brand-border bg-white px-3 py-2.5 text-sm text-brand-dark placeholder:text-brand-body/50 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-colors disabled:opacity-50",
                submissionType === "CODE" && "font-mono text-[13px]"
              )}
            />
            <div className="flex justify-between text-xs text-brand-body">
              <span />
              <span className={text.length > maxChars ? "text-red-500 font-semibold" : ""}>
                {text.length.toLocaleString()} / {maxChars.toLocaleString()}
              </span>
            </div>
          </div>
        )}

        {submissionType === "LINK" && (
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-brand-body uppercase tracking-wide">
              Submission URL
            </label>
            <div className="relative">
              <HiLink
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-body pointer-events-none"
              />
              <Input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://github.com/yourname/project"
                disabled={!canSubmit || isSubmitting}
                className="w-full h-10 pl-9 pr-3 rounded-md border border-brand-border bg-white text-sm text-brand-dark placeholder:text-brand-body/50 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-colors disabled:opacity-50"
              />
            </div>
            <p className="text-[13px] text-brand-body">
              Enter the URL to your submission (GitHub, Google Drive, etc.)
            </p>
          </div>
        )}

        {submissionType === "FILE" && (
          <div className="flex flex-col gap-3">
            <label className="text-xs font-semibold text-brand-body uppercase tracking-wide">
              File URL
            </label>

            {/* File drop zone — UI only, maps to fileUrl field */}
            <label
              className={cn(
                "flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-brand-border p-8 text-center cursor-pointer transition-colors",
                canSubmit && !isSubmitting
                  ? "hover:border-brand-blue hover:bg-brand-blue-light"
                  : "opacity-50 cursor-not-allowed"
              )}
            >
              <HiArrowUpTray size={28} className="text-brand-body" />
              <div>
                <p className="text-[15px] font-semibold text-brand-dark">
                  Drag & drop or paste your file URL
                </p>
                <p className="text-[13px] text-brand-body mt-1">
                  Accepted: PDF, DOC, DOCX, ZIP, Images
                </p>
              </div>
            </label>

            <div className="flex flex-col gap-1.5">
              <div className="relative">
                <HiPaperClip
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-body pointer-events-none"
                />
                <Input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://drive.google.com/file/..."
                  disabled={!canSubmit || isSubmitting}
                  className="w-full h-10 pl-9 pr-3 rounded-md border border-brand-border bg-white text-sm text-brand-dark placeholder:text-brand-body/50 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-colors disabled:opacity-50"
                />
              </div>
              <p className="text-[13px] text-brand-body">
                Upload your file to a cloud service and paste the shareable link above.
              </p>
            </div>

            {/* Show entered URL as "attached file" */}
            {linkUrl.trim() && (
              <div className="flex items-center gap-3 rounded-md border border-brand-border bg-brand-bg/50 px-3 py-2">
                <HiPaperClip size={15} className="text-brand-body shrink-0" />
                <p className="text-[15px] text-brand-dark truncate flex-1">
                  {linkUrl}
                </p>
                <button
                  onClick={() => setLinkUrl("")}
                  className="text-brand-body hover:text-red-500 transition-colors shrink-0"
                >
                  <HiXMark size={15} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Submission progress */}
        {isSubmitting && (
          <div className="flex flex-col gap-2">
            <p className="text-[15px] text-brand-body">Submitting assignment…</p>
            <ProgressBar value={progress} minValue={0} maxValue={100} aria-label="Submission progress">
              <ProgressBarTrack className="h-2 rounded-full bg-brand-bg">
                <ProgressBarFill className="h-full rounded-full bg-brand-blue transition-[width] duration-300" />
              </ProgressBarTrack>
            </ProgressBar>
            <p className="text-[13px] text-brand-body text-right">{progress}%</p>
          </div>
        )}

        {/* Error */}
        {submitError && (
          <Alert status="danger">
            <AlertIndicator>
              <HiExclamationTriangle size={16} />
            </AlertIndicator>
            <AlertContent>
              <AlertTitle>Submission Failed</AlertTitle>
              <AlertDescription>{submitError}</AlertDescription>
            </AlertContent>
            <button
              onClick={() => setSubmitError(null)}
              className="ml-auto text-red-400 hover:text-red-600 transition-colors shrink-0"
              aria-label="Dismiss error"
            >
              <HiXMark size={15} />
            </button>
          </Alert>
        )}

        {/* Submit button */}
        <Button
          className="w-full"
          disabled={!isValid || !canSubmit || isSubmitting}
          onClick={handleSubmit}
        >
          {isSubmitting ? "Submitting…" : "Submit Assignment"}
        </Button>

        <p className="text-[13px] text-center text-brand-body">
          By submitting, you confirm this is your own work.
        </p>
      </CardContent>
    </Card>
  );
}

// ─── Submission success ───────────────────────────────────────────────────────

// Shown after a successful submission — confirms it was received, warns if
// it was late, and offers a "Resubmit" button.
function SubmissionSuccess({
  submittedAt,
  isLate,
  assignment,
  onResubmit,
}: {
  submittedAt: string;
  isLate:      boolean;
  assignment:  Assignment;
  onResubmit:  () => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <Alert status="success">
        <AlertIndicator>
          <HiCheckCircle size={16} />
        </AlertIndicator>
        <AlertContent>
          <AlertTitle>Assignment Submitted</AlertTitle>
          <AlertDescription>
            Submitted on {formatDateShort(submittedAt)} · Your instructor will review it shortly.
          </AlertDescription>
        </AlertContent>
      </Alert>

      {isLate && (
        <Alert status="warning">
          <AlertIndicator>
            <HiClock size={16} />
          </AlertIndicator>
          <AlertContent>
            <AlertTitle>Late Submission</AlertTitle>
            <AlertDescription>
              This was submitted after the due date. A penalty of {assignment.latePenalty}% per day applies.
            </AlertDescription>
          </AlertContent>
        </Alert>
      )}

      <Card className="bg-white">
        <CardContent className="flex flex-col gap-4 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] text-brand-body uppercase tracking-wide font-medium">Points Available</p>
              <p className="flex items-center gap-1.5 text-[19px] font-bold text-brand-dark mt-1">
                <HiStar size={16} className="text-amber-500" />
                {assignment.totalPoints} XP
              </p>
            </div>
            <Chip size="sm" variant="soft" color="success" className="text-xs">
              Submitted
            </Chip>
          </div>

          <Divider />

          <Alert status="accent">
            <AlertIndicator>
              <HiInformationCircle size={16} />
            </AlertIndicator>
            <AlertContent>
              <AlertDescription>
                Your instructor will grade this and you'll earn XP once feedback is posted.
              </AlertDescription>
            </AlertContent>
          </Alert>

          <Button
            variant="secondary"
            size="sm"
            className="w-full text-sm"
            onClick={onResubmit}
          >
            Resubmit Assignment
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

// The page where a student views one assignment's instructions and submits
// their work (or sees a confirmation once they've already submitted).
export default function AssignmentSubmissionPage() {
  const params       = useParams<{ courseId: string; assignmentId: string }>();
  const courseId     = params.courseId;
  const assignmentId = params.assignmentId;
  const router       = useRouter();

  const {
    assignments,
    isLoading,
    error,
    submit,
  } = useCourseAssignments(courseId);

  // Track submission state locally (no GET /submissions API available)
  const [submittedAt,  setSubmittedAt]  = useState<string | null>(null);
  const [showForm,     setShowForm]     = useState(true);

  const assignment: Assignment | undefined = useMemo(
    () => assignments.find((a) => a._id === assignmentId),
    [assignments, assignmentId]
  );

  // Records that the assignment was just submitted, switching the view from
  // the submission form to the success confirmation.
  function handleSubmitted(ts: string) {
    setSubmittedAt(ts);
    setShowForm(false);
  }

  // ── Loading ───────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto">
        <PageSkeleton />
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <Alert status="danger">
          <AlertIndicator>
            <HiExclamationTriangle size={16} />
          </AlertIndicator>
          <AlertContent>
            <AlertTitle>Failed to load assignments</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </AlertContent>
        </Alert>
      </div>
    );
  }

  // ── Assignment not found ──────────────────────────────────────────────────
  if (!assignment) {
    return (
      <div className="max-w-2xl mx-auto flex flex-col items-center justify-center py-20 gap-4 text-center">
        <HiExclamationTriangle size={40} className="text-red-400" />
        <div>
          <p className="text-[19px] font-bold text-brand-dark">Assignment not found</p>
          <p className="text-[15px] text-brand-body mt-1">
            This assignment may have been removed or you don't have access.
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={() => router.push(`/student/courses/${courseId}`)}
        >
          Back to Course
        </Button>
      </div>
    );
  }

  const isLate = getDueStatus(assignment.dueDate) === "overdue";

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">

      {/* ── Back navigation ── */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-brand-body hover:text-brand-dark -ml-2"
          onClick={() => router.push(`/student/courses/${courseId}`)}
        >
          <HiArrowLeft size={15} />
          Back to Course
        </Button>
      </div>

      {/* ── Assignment detail ── */}
      <AssignmentDetailCard assignment={assignment} />

      {/* ── Submission area ── */}
      {submittedAt && !showForm ? (
        <SubmissionSuccess
          submittedAt={submittedAt}
          isLate={isLate}
          assignment={assignment}
          onResubmit={() => setShowForm(true)}
        />
      ) : (
        <SubmissionForm
          assignment={assignment}
          courseId={courseId}
          submit={submit}
          onSubmitted={handleSubmitted}
        />
      )}
    </div>
  );
}
