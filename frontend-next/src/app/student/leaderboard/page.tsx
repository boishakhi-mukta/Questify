"use client";

/**
 * ============================================================================
 * QUESTIFY PAGE ROUTE: Student Leaderboard
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * A leaderboard display ranking students by their earned XP scores.
 * 
 * WHY IT EXISTS:
 * Encourages learning engagement through friendly gamified competition.
 * 
 * HOW IT WORKS (Technical Overview):
 * Fetches rankings list and maps them to a leaderboard interface.
 * ============================================================================
 */

import { useState, useMemo } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  Chip,
  Skeleton,
  Tabs,
  TabListContainer,
  TabList,
  Tab,
  TabIndicator,
  TabPanel,
  Avatar,
  AvatarImage,
  AvatarFallback,
  Select,
  SelectTrigger,
  SelectValue,
  SelectPopover,
  ListBox,
  ListBoxItem,
  ProgressBar,
  ProgressBarTrack,
  ProgressBarFill,
} from "@heroui/react";
import {
  HiTrophy,
  HiArrowUp,
  HiArrowDown,
  HiMinus,
  HiChevronLeft,
  HiChevronRight,
  HiExclamationTriangle,
  HiArrowPath,
  HiStar,
  HiUserGroup,
} from "react-icons/hi2";
import { useLeaderboard } from "@/hooks/api/useLeaderboard";
import { useMyEnrollments } from "@/hooks/api/useMyEnrollments";
import { useAuthContext } from "@/contexts/AuthContext";
import type { LeaderboardEntry } from "@/types/api-response";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 20;

type Period = "week" | "month" | "all";

const PERIOD_KEY: Record<Period, string> = {
  week:  "leaderboardPage.thisWeek",
  month: "leaderboardPage.thisMonth",
  all:   "leaderboardPage.allTime",
};

const RANK_MEDALS = ["🥇", "🥈", "🥉"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function rankDisplay(rank: number) {
  if (rank <= 3) return RANK_MEDALS[rank - 1];
  return `#${rank}`;
}

function initials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0] ?? "")
    .join("")
    .toUpperCase();
}

function percentile(rank: number, total: number): number {
  if (total <= 1) return 100;
  return Math.round((1 - (rank - 1) / total) * 100);
}

// ─── Divider ─────────────────────────────────────────────────────────────────

function Divider({ className }: { className?: string }) {
  return <div className={cn("h-px bg-brand-border", className)} />;
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function LeaderboardSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <Skeleton className="h-9 w-56 rounded-lg" />

      {/* Tabs + filter row */}
      <div className="flex gap-4 flex-wrap items-end">
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-9 w-24 rounded-full" />
          ))}
        </div>
        <Skeleton className="h-9 w-40 rounded-md" />
      </div>

      {/* Your rank card */}
      <Skeleton className="h-36 w-full rounded-xl" />

      {/* Table rows */}
      <div className="flex flex-col gap-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-md" />
        ))}
      </div>
    </div>
  );
}

// ─── Your rank card ───────────────────────────────────────────────────────────

function YourRankCard({
  entry,
  total,
  period,
}: {
  entry:  LeaderboardEntry;
  total:  number;
  period: Period;
}) {
  const { t } = useTranslation();
  const pct         = percentile(entry.rank, total);
  const progressVal = Math.min((entry.totalXP / Math.max(entry.totalXP, 5000)) * 100, 100);

  return (
    <Card className="bg-white border-2 border-brand-blue overflow-hidden">
      {/* Top accent bar */}
      <div className="h-1.5 bg-gradient-to-r from-brand-blue to-blue-400" />

      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-brand-blue/10 flex items-center justify-center shrink-0">
            <HiTrophy size={24} className="text-brand-blue" />
          </div>
          <div>
            <p className="text-lg font-bold text-brand-dark">{t("leaderboardPage.yourRank")}</p>
            <p className="text-sm text-brand-body">
              {t(PERIOD_KEY[period])} · {total} {t("leaderboardPage.participants")}
            </p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-3xl font-black text-brand-dark leading-none">
              {rankDisplay(entry.rank)}
            </p>
            <p className="text-xs text-brand-body mt-0.5">{t("leaderboardPage.position")}</p>
          </div>
        </div>
      </CardHeader>

      <Divider />

      <CardContent className="flex flex-col gap-4 pt-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-brand-body uppercase tracking-wide font-medium mb-1">
              {t("leaderboardPage.totalXp")}
            </p>
            <p className="flex items-center gap-1.5 text-2xl font-black text-brand-dark">
              <HiStar size={18} className="text-amber-500" />
              {entry.totalXP.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-brand-body uppercase tracking-wide font-medium mb-1">
              {t("leaderboardPage.percentile")}
            </p>
            <Chip
              size="sm"
              variant="soft"
              color={pct >= 90 ? "success" : pct >= 50 ? "default" : "warning"}
              className="text-sm font-bold"
            >
              {t("leaderboardPage.top")} {100 - pct + 1}%
            </Chip>
          </div>
          {entry.courseCount !== undefined && (
            <div>
              <p className="text-xs text-brand-body uppercase tracking-wide font-medium mb-1">
                {t("leaderboardPage.courses")}
              </p>
              <p className="text-lg font-bold text-brand-dark">{entry.courseCount}</p>
            </div>
          )}
        </div>

        {/* XP progress toward top 10% */}
        <div>
          <div className="flex justify-between text-xs text-brand-body mb-1.5">
            <span>{t("leaderboardPage.xpProgress")}</span>
            <span className="font-semibold text-brand-dark">
              {entry.totalXP.toLocaleString()} XP
            </span>
          </div>
          <ProgressBar
            value={progressVal}
            minValue={0}
            maxValue={100}
            aria-label="XP progress"
          >
            <ProgressBarTrack className="h-2 rounded-full bg-brand-bg">
              <ProgressBarFill className="h-full rounded-full bg-gradient-to-r from-brand-blue to-blue-400 transition-[width]" />
            </ProgressBarTrack>
          </ProgressBar>
          <p className="text-xs text-brand-body mt-1.5">
            {t("leaderboardPage.youAreInTop")}{" "}
            <span className="font-semibold text-brand-dark">{100 - pct + 1}%</span>{" "}
            {t("leaderboardPage.ofAllStudents")}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Leaderboard row ──────────────────────────────────────────────────────────

function LeaderboardRow({
  entry,
  isCurrent,
  topXP,
}: {
  entry:     LeaderboardEntry;
  isCurrent: boolean;
  topXP:     number;
}) {
  const { t } = useTranslation();
  const barWidth = topXP > 0 ? Math.round((entry.totalXP / topXP) * 100) : 0;

  return (
    <tr
      className={cn(
        "group transition-colors",
        isCurrent
          ? "bg-brand-blue/5 hover:bg-brand-blue/10"
          : "hover:bg-brand-bg/70"
      )}
    >
      {/* Rank */}
      <td className="px-4 py-3 text-center w-16">
        <span
          className={cn(
            "font-black text-base leading-none",
            entry.rank === 1 && "text-amber-500",
            entry.rank === 2 && "text-slate-400",
            entry.rank === 3 && "text-amber-700",
            entry.rank > 3 && "text-brand-body text-sm"
          )}
        >
          {entry.rank <= 3 ? RANK_MEDALS[entry.rank - 1] : `#${entry.rank}`}
        </span>
      </td>

      {/* Student */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <Avatar size="sm" color="default">
            {entry.avatar ? (
              <AvatarImage src={entry.avatar} alt={entry.name} />
            ) : null}
            <AvatarFallback>{initials(entry.name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p
              className={cn(
                "text-sm font-semibold truncate",
                isCurrent ? "text-brand-blue" : "text-brand-dark"
              )}
            >
              {entry.name}
              {isCurrent && (
                <span className="ml-2 text-xs font-normal text-brand-blue/70">
                  {t("leaderboardPage.you")}
                </span>
              )}
            </p>
            {entry.email && (
              <p className="text-xs text-brand-body truncate">{entry.email}</p>
            )}
          </div>
        </div>
      </td>

      {/* XP + bar */}
      <td className="px-4 py-3">
        <div className="flex flex-col gap-1">
          <p className="flex items-center gap-1 text-sm font-bold text-brand-dark">
            <HiStar size={13} className="text-amber-500 shrink-0" />
            {entry.totalXP.toLocaleString()}
          </p>
          {/* Relative XP bar */}
          <div className="h-1 rounded-full bg-brand-bg w-24 hidden sm:block">
            <div
              className={cn(
                "h-full rounded-full transition-[width]",
                entry.rank === 1
                  ? "bg-amber-400"
                  : isCurrent
                  ? "bg-brand-blue"
                  : "bg-brand-border"
              )}
              style={{ width: `${barWidth}%` }}
            />
          </div>
        </div>
      </td>

      {/* Courses */}
      <td className="px-4 py-3 hidden sm:table-cell text-center">
        {entry.courseCount !== undefined ? (
          <span className="text-sm text-brand-dark font-semibold">
            {entry.courseCount}
          </span>
        ) : (
          <span className="text-brand-body/40">—</span>
        )}
      </td>
    </tr>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────

function PaginationStrip({
  page,
  total,
  onPage,
}: {
  page:   number;
  total:  number;
  onPage: (p: number) => void;
}) {
  const { t } = useTranslation();
  if (total <= 1) return null;

  // Clamp visible page buttons to a window around current page
  const window = 5;
  const half   = Math.floor(window / 2);
  const start  = Math.max(1, Math.min(page - half, total - window + 1));
  const end    = Math.min(total, start + window - 1);
  const pages  = Array.from({ length: end - start + 1 }, (_, i) => i + start);

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <button
        disabled={page <= 1}
        onClick={() => onPage(page - 1)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-brand-border text-sm text-brand-body hover:bg-brand-bg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <HiChevronLeft size={14} />
        {t("leaderboardPage.prev")}
      </button>

      {start > 1 && (
        <>
          <button
            onClick={() => onPage(1)}
            className="w-8 h-8 rounded-md text-sm text-brand-dark hover:bg-brand-bg transition-colors"
          >
            1
          </button>
          {start > 2 && (
            <span className="text-brand-body text-sm px-1">…</span>
          )}
        </>
      )}

      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPage(p)}
          className={cn(
            "w-8 h-8 rounded-md text-sm font-medium transition-colors",
            p === page
              ? "bg-brand-blue text-white"
              : "text-brand-dark hover:bg-brand-bg"
          )}
        >
          {p}
        </button>
      ))}

      {end < total && (
        <>
          {end < total - 1 && (
            <span className="text-brand-body text-sm px-1">…</span>
          )}
          <button
            onClick={() => onPage(total)}
            className="w-8 h-8 rounded-md text-sm text-brand-dark hover:bg-brand-bg transition-colors"
          >
            {total}
          </button>
        </>
      )}

      <button
        disabled={page >= total}
        onClick={() => onPage(page + 1)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-brand-border text-sm text-brand-body hover:bg-brand-bg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        {t("leaderboardPage.next")}
        <HiChevronRight size={14} />
      </button>
    </div>
  );
}

// ─── Course filter select ─────────────────────────────────────────────────────

function CourseFilter({
  value,
  onChange,
  courses,
}: {
  value:    string;
  onChange: (v: string) => void;
  courses:  { id: string; title: string }[];
}) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-1 min-w-[180px]">
      <label className="text-xs font-semibold text-brand-body uppercase tracking-wide">
        {t("leaderboardPage.filterByCourse")}
      </label>
      <Select selectedKey={value} onSelectionChange={(key) => onChange(key as string)}>
        <SelectTrigger className="h-9 rounded-md border border-brand-border bg-white px-3 text-sm text-brand-dark flex items-center justify-between gap-2 hover:border-brand-blue transition-colors focus:outline-none">
          <SelectValue className="flex-1 text-left" />
        </SelectTrigger>
        <SelectPopover className="z-50 min-w-[180px] rounded-md border border-brand-border bg-white shadow-md p-1">
          <ListBox className="outline-none">
            <ListBoxItem
              id="all"
              className="flex items-center px-3 py-2 text-sm rounded-sm cursor-pointer outline-none transition-colors text-brand-dark hover:bg-brand-bg"
            >
              {t("leaderboardPage.allCourses")}
            </ListBoxItem>
            {courses.map((c) => (
              <ListBoxItem
                key={c.id}
                id={c.id}
                className="flex items-center px-3 py-2 text-sm rounded-sm cursor-pointer outline-none transition-colors text-brand-dark hover:bg-brand-bg truncate"
              >
                {c.title}
              </ListBoxItem>
            ))}
          </ListBox>
        </SelectPopover>
      </Select>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function LeaderboardPage() {
  const { user } = useAuthContext();
  const { t } = useTranslation();

  const [period,         setPeriod]         = useState<Period>("all");
  const [selectedCourse, setSelectedCourse] = useState<string>("all");
  const [page,           setPage]           = useState(1);

  const {
    entries,
    isLoading,
    error,
    refetch,
  } = useLeaderboard({
    timeframe: period === "all" ? undefined : period,
    limit:     200,
  });

  const { enrollments } = useMyEnrollments();

  // Course options derived from enrollments
  const courseOptions = useMemo(
    () =>
      enrollments.map((e) => ({
        id:    e.courseId._id,
        title: e.courseId.title,
      })),
    [enrollments]
  );

  // My entry in the leaderboard
  const myEntry = useMemo(
    () => entries.find((e) => e.studentId === user?._id),
    [entries, user]
  );

  // Client-side course filter — note: since LeaderboardEntry has no courseId
  // breakdown, "course" filter narrows by enrolled courses' student pool.
  // For now it shows global XP (a per-course endpoint would be needed for true filtering).
  const filtered = entries; // All entries — course filter is a UX placeholder for API extension

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged      = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const topXP      = entries[0]?.totalXP ?? 0;

  function handlePeriod(key: Period) {
    setPeriod(key);
    setPage(1);
  }

  if (isLoading) return <LeaderboardSkeleton />;

  return (
    <div className="flex flex-col gap-8">

      {/* ── Page header ── */}
      <div>
        <h1 className="text-2xl font-bold text-brand-dark">{t("leaderboardPage.title")}</h1>
        <p className="text-sm text-brand-body mt-1">
          {t("leaderboardPage.subtitle")}
        </p>
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <HiExclamationTriangle size={16} className="shrink-0" />
          <span className="flex-1">{t("leaderboardPage.failedToLoad")} {error}</span>
          <button
            onClick={refetch}
            className="flex items-center gap-1 font-semibold shrink-0 hover:text-red-900 transition-colors"
          >
            <HiArrowPath size={14} />
            {t("leaderboardPage.retry")}
          </button>
        </div>
      )}

      {/* ── Controls row: Tabs + Course filter ── */}
      <div className="flex flex-col sm:flex-row sm:items-end gap-4 flex-wrap">
        {/* Period tabs */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-brand-body uppercase tracking-wide">
            {t("leaderboardPage.timePeriod")}
          </label>
          <Tabs
            variant="primary"
            selectedKey={period}
            onSelectionChange={(key) => handlePeriod(key as Period)}
          >
            <TabListContainer>
              <TabList className="gap-1 p-1 bg-brand-bg rounded-lg border border-brand-border">
                {(["week", "month", "all"] as Period[]).map((p) => (
                  <Tab
                    key={p}
                    id={p}
                    className={cn(
                      "px-4 py-1.5 rounded-md text-sm font-semibold transition-colors cursor-pointer outline-none",
                      "data-[selected]:bg-brand-blue data-[selected]:text-white",
                      "text-brand-body hover:text-brand-dark"
                    )}
                  >
                    {t(PERIOD_KEY[p])}
                  </Tab>
                ))}
              </TabList>
              <TabIndicator className="hidden" />
            </TabListContainer>
            {(["week", "month", "all"] as Period[]).map((p) => (
              <TabPanel key={p} id={p} className="hidden">{null}</TabPanel>
            ))}
          </Tabs>
        </div>

        {/* Course filter */}
        <CourseFilter
          value={selectedCourse}
          onChange={(v) => { setSelectedCourse(v); setPage(1); }}
          courses={courseOptions}
        />

        {/* Participant count */}
        <div className="sm:ml-auto flex items-center gap-1.5 text-sm text-brand-body">
          <HiUserGroup size={16} />
          <span>
            <span className="font-semibold text-brand-dark">
              {entries.length}
            </span>{" "}
            {t("leaderboardPage.students")}
          </span>
        </div>
      </div>

      {/* ── Your rank card (when in leaderboard) ── */}
      {myEntry && (
        <YourRankCard entry={myEntry} total={entries.length} period={period} />
      )}

      {/* ── Leaderboard table ── */}
      {entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <HiTrophy size={40} className="text-brand-body/30" />
          <p className="text-base font-semibold text-brand-dark">{t("leaderboardPage.noDataYet")}</p>
          <p className="text-sm text-brand-body">
            {t("leaderboardPage.noDataDesc")}
          </p>
        </div>
      ) : (
        <>
          <div className="rounded-xl border border-brand-border overflow-hidden bg-white">
            {/* Table header */}
            <div className="bg-brand-bg border-b border-brand-border px-4 py-2.5">
              <p className="text-xs font-bold uppercase tracking-wider text-brand-body">
                {t("leaderboardPage.rankings")} — {t(PERIOD_KEY[period])}
                {selectedCourse !== "all" && (
                  <span className="ml-2 font-normal normal-case text-brand-blue">
                    · {courseOptions.find((c) => c.id === selectedCourse)?.title ?? "Course"}
                  </span>
                )}
              </p>
            </div>

            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-brand-border">
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-brand-body w-16 text-center">
                    {t("leaderboardPage.rank")}
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-brand-body">
                    {t("leaderboardPage.student")}
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-brand-body">
                    {t("leaderboardPage.xp")}
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-brand-body hidden sm:table-cell text-center">
                    {t("leaderboardPage.courses")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {paged.map((entry) => (
                  <LeaderboardRow
                    key={entry.studentId}
                    entry={entry}
                    isCurrent={entry.studentId === user?._id}
                    topXP={topXP}
                  />
                ))}
              </tbody>
            </table>

            {/* Table footer */}
            <div className="border-t border-brand-border bg-brand-bg/50 px-4 py-2.5 text-xs text-brand-body">
              {t("leaderboardPage.showing")}{" "}
              <span className="font-semibold text-brand-dark">
                {(page - 1) * PAGE_SIZE + 1}–
                {Math.min(page * PAGE_SIZE, filtered.length)}
              </span>{" "}
              {t("leaderboardPage.of")}{" "}
              <span className="font-semibold text-brand-dark">{filtered.length}</span>{" "}
              {t("leaderboardPage.students")}
            </div>
          </div>

          {/* Pagination */}
          <PaginationStrip
            page={page}
            total={totalPages}
            onPage={(p) => {
              setPage(p);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        </>
      )}

      {/* ── Top 3 podium (when not loading, has data) ── */}
      {entries.length >= 3 && page === 1 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-bold text-brand-body uppercase tracking-wide">
            {t("leaderboardPage.topPerformers")}
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {entries.slice(0, 3).map((entry, i) => {
              const colors = [
                "border-amber-400 bg-amber-50",
                "border-slate-300 bg-slate-50",
                "border-amber-700/40 bg-amber-50/50",
              ];
              return (
                <Card
                  key={entry.studentId}
                  className={cn(
                    "bg-white border-2 text-center",
                    colors[i]
                  )}
                >
                  <CardContent className="flex flex-col items-center gap-2 pt-4">
                    <span className="text-3xl">{RANK_MEDALS[i]}</span>
                    <Avatar size="sm" color="default">
                      {entry.avatar ? (
                        <AvatarImage src={entry.avatar} alt={entry.name} />
                      ) : null}
                      <AvatarFallback>{initials(entry.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-bold text-brand-dark truncate max-w-[100px]">
                        {entry.name.split(" ")[0]}
                      </p>
                      <p className="flex items-center justify-center gap-0.5 text-xs font-semibold text-brand-body mt-0.5">
                        <HiStar size={11} className="text-amber-500" />
                        {entry.totalXP.toLocaleString()} XP
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
