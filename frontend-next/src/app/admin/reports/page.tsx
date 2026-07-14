"use client";

/**
 * ============================================================================
 * QUESTIFY PAGE ROUTE: Reports Export
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * Page allowing admins to download CSV/PDF spreadsheet reports.
 * 
 * WHY IT EXISTS:
 * Helps managers export data logs.
 * 
 * HOW IT WORKS (Technical Overview):
 * Calls reports utilities returning spreadsheet data streams.
 * ============================================================================
 */

import { useState, useId } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Chip,
  ModalRoot,
  ModalBackdrop,
  ModalContainer,
  ModalDialog,
  ModalHeader,
  ModalHeading,
  ModalBody,
  ModalFooter,
  ModalCloseTrigger,
  useOverlayState,
} from "@heroui/react";
import { toast } from "sonner";
import {
  HiDocumentChartBar,
  HiClipboardDocumentList,
  HiSparkles,
  HiUserGroup,
  HiArrowDownTray,
  HiArrowPath,
  HiCheckCircle,
  HiExclamationCircle,
  HiClock,
  HiBriefcase,
} from "react-icons/hi2";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

type ReportKey    = "enrollment" | "attendance" | "xp" | "activity";
type ReportFormat = "csv" | "pdf" | "xlsx";
type ReportStatus = "ready" | "failed";

interface ReportConfig {
  department: string;
  format:     ReportFormat;
  dateFrom:   string;
  dateTo:     string;
}

interface RecentReport {
  id:          string;
  typeKey:     ReportKey;
  typeLabel:   string;
  generatedAt: string;
  format:      ReportFormat;
  size:        string;
  status:      ReportStatus;
}

// ── Report type definitions ───────────────────────────────────────────────────

interface ReportTypeDef {
  key:         ReportKey;
  label:       string;
  description: string;
  icon:        React.ElementType;
  iconBg:      string;
  lastRun:     string;
}

const REPORT_TYPES: ReportTypeDef[] = [
  {
    key:         "enrollment",
    label:       "Enrollment Report",
    description: "Detailed enrollment data by course, department, or semester — includes active, completed, and dropout counts.",
    icon:        HiDocumentChartBar,
    iconBg:      "bg-gradient-to-br from-brand-blue to-indigo-600",
    lastRun:     "2 hours ago",
  },
  {
    key:         "attendance",
    label:       "Attendance Report",
    description: "Attendance rates by course, department, or date range with trend analysis.",
    icon:        HiClipboardDocumentList,
    iconBg:      "bg-gradient-to-br from-emerald-500 to-teal-600",
    lastRun:     "1 day ago",
  },
  {
    key:         "xp",
    label:       "XP Distribution Report",
    description: "XP breakdown by activity type, student, or course — useful for tracking gamification engagement.",
    icon:        HiSparkles,
    iconBg:      "bg-gradient-to-br from-amber-500 to-orange-500",
    lastRun:     "3 days ago",
  },
  {
    key:         "activity",
    label:       "User Activity Report",
    description: "Platform activity log — logins, course access, submissions, and material views.",
    icon:        HiUserGroup,
    iconBg:      "bg-gradient-to-br from-violet-500 to-purple-600",
    lastRun:     "5 days ago",
  },
];

// ── Seed recent reports ───────────────────────────────────────────────────────

const SEED_REPORTS: RecentReport[] = [
  { id: "r1", typeKey: "enrollment", typeLabel: "Enrollment Report",      generatedAt: "Today, 10:23 AM", format: "csv",  size: "48 KB",  status: "ready"  },
  { id: "r2", typeKey: "attendance", typeLabel: "Attendance Report",      generatedAt: "Yesterday, 2:11 PM", format: "pdf",  size: "1.2 MB", status: "ready"  },
  { id: "r3", typeKey: "xp",        typeLabel: "XP Distribution Report",  generatedAt: "Jun 23, 9:04 AM",   format: "xlsx", size: "220 KB", status: "ready"  },
  { id: "r4", typeKey: "activity",  typeLabel: "User Activity Report",    generatedAt: "Jun 21, 3:47 PM",   format: "csv",  size: "312 KB", status: "ready"  },
  { id: "r5", typeKey: "enrollment","typeLabel": "Enrollment Report",     generatedAt: "Jun 19, 11:30 AM",  format: "pdf",  size: "890 KB", status: "ready"  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const FORMAT_LABEL: Record<ReportFormat, string> = { csv: "CSV", pdf: "PDF", xlsx: "Excel" };

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function nowLabel() {
  return new Date().toLocaleString("en-US", {
    month: "short", day: "numeric",
    hour: "numeric", minute: "2-digit", hour12: true,
  });
}

function fakeSizeKb() {
  return `${Math.floor(Math.random() * 800 + 80)} KB`;
}

function buildCsvBlob(typeLabel: string, department: string, dateFrom: string, dateTo: string) {
  const header = "Report Type,Department,Date From,Date To,Generated At";
  const row    = `"${typeLabel}","${department}","${dateFrom}","${dateTo}","${new Date().toISOString()}"`;
  return new Blob([`${header}\n${row}\n`], { type: "text/csv" });
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a   = document.createElement("a");
  a.href    = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ── Report card ───────────────────────────────────────────────────────────────

function ReportCard({
  def,
  onGenerate,
}: {
  def:        ReportTypeDef;
  onGenerate: (key: ReportKey) => void;
}) {
  const Icon = def.icon;
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0", def.iconBg)}>
            <Icon size={18} className="text-white" />
          </div>
          <CardTitle className="text-[15px]">{def.label}</CardTitle>
        </div>
      </CardHeader>

      <div className="h-px bg-brand-border dark:bg-white/8 mx-5" />

      <CardContent className="pt-4 pb-5 flex flex-col gap-4 flex-1">
        <p className="text-[13px] text-brand-body dark:text-white/60 leading-relaxed">
          {def.description}
        </p>

        <div className="flex items-center justify-between gap-2 mt-auto">
          <Button
            variant="default"
            size="sm"
            onClick={() => onGenerate(def.key)}
          >
            Generate
          </Button>

          <span className="flex items-center gap-1.5 text-[12px] text-brand-body/55 dark:text-white/35">
            <HiClock size={13} />
            Last: {def.lastRun}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Config modal ──────────────────────────────────────────────────────────────

function ConfigModal({
  state,
  typeDef,
  config,
  isGenerating,
  onChange,
  onSubmit,
}: {
  state:        ReturnType<typeof useOverlayState>;
  typeDef:      ReportTypeDef | undefined;
  config:       ReportConfig;
  isGenerating: boolean;
  onChange:     (patch: Partial<ReportConfig>) => void;
  onSubmit:     () => void;
}) {
  const fieldId = useId();

  return (
    <ModalRoot state={state}>
      <ModalBackdrop />
      <ModalContainer size="md" placement="center">
        <ModalDialog>
          <ModalHeader className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {typeDef && (
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", typeDef.iconBg)}>
                  <typeDef.icon size={15} className="text-white" />
                </div>
              )}
              <ModalHeading className="text-[16px] font-bold">
                Configure {typeDef?.label ?? "Report"}
              </ModalHeading>
            </div>
            <ModalCloseTrigger />
          </ModalHeader>

          <ModalBody className="space-y-5 py-5">
            {/* Department */}
            <div className="space-y-1.5">
              <label htmlFor={`${fieldId}-dept`} className="text-[12px] font-semibold text-brand-body/70 dark:text-white/50 uppercase tracking-wide">
                Department
              </label>
              <Select
                value={config.department}
                onValueChange={(v) => onChange({ department: v })}
              >
                <SelectTrigger
                  id={`${fieldId}-dept`}
                  className="dark:bg-slate-800 dark:border-white/10 dark:text-white"
                >
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="cs">Computer Science</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="engineering">Engineering</SelectItem>
                  <SelectItem value="science">Natural Sciences</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Format */}
            <div className="space-y-1.5">
              <label htmlFor={`${fieldId}-fmt`} className="text-[12px] font-semibold text-brand-body/70 dark:text-white/50 uppercase tracking-wide">
                Export Format
              </label>
              <Select
                value={config.format}
                onValueChange={(v) => onChange({ format: v as ReportFormat })}
              >
                <SelectTrigger
                  id={`${fieldId}-fmt`}
                  className="dark:bg-slate-800 dark:border-white/10 dark:text-white"
                >
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV — spreadsheet rows</SelectItem>
                  <SelectItem value="pdf">PDF — formatted document</SelectItem>
                  <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date range */}
            <div className="space-y-1.5">
              <span className="block text-[12px] font-semibold text-brand-body/70 dark:text-white/50 uppercase tracking-wide">
                Date Range
              </span>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label htmlFor={`${fieldId}-from`} className="text-[11px] text-brand-body/55 dark:text-white/35">
                    From
                  </label>
                  <input
                    id={`${fieldId}-from`}
                    type="date"
                    value={config.dateFrom}
                    max={config.dateTo || undefined}
                    onChange={(e) => onChange({ dateFrom: e.target.value })}
                    className="w-full h-10 rounded-md border border-brand-border dark:border-white/10 bg-white dark:bg-slate-800 px-3 text-[13px] text-brand-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor={`${fieldId}-to`} className="text-[11px] text-brand-body/55 dark:text-white/35">
                    To
                  </label>
                  <input
                    id={`${fieldId}-to`}
                    type="date"
                    value={config.dateTo}
                    min={config.dateFrom || undefined}
                    max={todayIso()}
                    onChange={(e) => onChange({ dateTo: e.target.value })}
                    className="w-full h-10 rounded-md border border-brand-border dark:border-white/10 bg-white dark:bg-slate-800 px-3 text-[13px] text-brand-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
                  />
                </div>
              </div>
            </div>

            {/* Info row */}
            <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg bg-brand-blue/8 dark:bg-brand-blue/12 border border-brand-blue/15">
              <HiBriefcase size={15} className="text-brand-blue mt-0.5 shrink-0" />
              <p className="text-[12px] text-brand-blue/80 dark:text-brand-blue/70 leading-snug">
                Large reports may take a few seconds to generate. A download will start automatically when ready.
              </p>
            </div>
          </ModalBody>

          <ModalFooter className="gap-2">
            <ModalCloseTrigger>
              <Button variant="outline" size="sm">
                Cancel
              </Button>
            </ModalCloseTrigger>
            <Button
              variant="default"
              size="sm"
              onClick={onSubmit}
              disabled={isGenerating}
              className="gap-1.5 min-w-[130px]"
            >
              {isGenerating ? (
                <>
                  <HiArrowPath size={14} className="animate-spin" />
                  Generating…
                </>
              ) : (
                <>
                  <HiArrowDownTray size={14} />
                  Generate &amp; Download
                </>
              )}
            </Button>
          </ModalFooter>
        </ModalDialog>
      </ModalContainer>
    </ModalRoot>
  );
}

// ── Recent reports table ──────────────────────────────────────────────────────

function RecentReportsTable({ reports }: { reports: RecentReport[] }) {
  const TH = "px-4 py-2.5 text-[11px] font-bold uppercase tracking-wide text-brand-body/60 dark:text-white/40 text-left whitespace-nowrap";
  const TD = "px-4 py-3 text-[13px]";

  const statusChip = (status: ReportStatus) =>
    status === "ready" ? (
      <Chip color="success" variant="soft" size="sm">
        <span className="flex items-center gap-1">
          <HiCheckCircle size={11} />
          Ready
        </span>
      </Chip>
    ) : (
      <Chip color="danger" variant="soft" size="sm">
        <span className="flex items-center gap-1">
          <HiExclamationCircle size={11} />
          Failed
        </span>
      </Chip>
    );

  const formatIcon: Record<ReportFormat, string> = { csv: "📄", pdf: "📕", xlsx: "📊" };

  function handleDownload(report: RecentReport) {
    const blob = buildCsvBlob(report.typeLabel, "All Departments", "", "");
    triggerDownload(blob, `${report.typeKey}-report-${Date.now()}.${report.format}`);
    toast.success("Downloaded", { description: `${report.typeLabel} · ${FORMAT_LABEL[report.format]}`, icon: "⬇️" });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Reports</CardTitle>
      </CardHeader>

      <div className="h-px bg-brand-border dark:bg-white/8" />

      <CardContent className="px-0 pb-4">
        {reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 gap-3 text-center">
            <HiDocumentChartBar size={36} className="text-brand-body/25 dark:text-white/15" />
            <p className="text-[14px] font-semibold text-brand-body dark:text-white/60">No reports yet</p>
            <p className="text-[12px] text-brand-body/55 dark:text-white/35">
              Generate a report above to see it here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-brand-border dark:border-white/8">
                  <th className={TH}>Type</th>
                  <th className={TH}>Generated</th>
                  <th className={TH}>Format</th>
                  <th className={TH}>Size</th>
                  <th className={TH}>Status</th>
                  <th className={cn(TH, "text-right")}>Action</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-brand-border/40 dark:border-white/5 hover:bg-brand-bg dark:hover:bg-white/4 transition-colors"
                  >
                    <td className={TD}>
                      <span className="font-semibold text-brand-dark dark:text-white">{r.typeLabel}</span>
                    </td>
                    <td className={cn(TD, "text-brand-body dark:text-white/60 whitespace-nowrap")}>
                      {r.generatedAt}
                    </td>
                    <td className={TD}>
                      <span className="font-mono text-[12px] text-brand-body/70 dark:text-white/50">
                        {formatIcon[r.format]} {FORMAT_LABEL[r.format]}
                      </span>
                    </td>
                    <td className={cn(TD, "tabular-nums text-brand-body dark:text-white/60")}>
                      {r.size}
                    </td>
                    <td className={TD}>{statusChip(r.status)}</td>
                    <td className={cn(TD, "text-right")}>
                      <button
                        type="button"
                        disabled={r.status !== "ready"}
                        onClick={() => handleDownload(r)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-semibold text-brand-blue hover:bg-brand-blue/8 dark:hover:bg-brand-blue/15 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <HiArrowDownTray size={13} />
                        Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

const DEFAULT_CONFIG: ReportConfig = {
  department: "all",
  format:     "csv",
  dateFrom:   "",
  dateTo:     todayIso(),
};

export default function AdminReportsPage() {
  const modal        = useOverlayState();
  const [activeKey, setActiveKey]       = useState<ReportKey | null>(null);
  const [config, setConfig]             = useState<ReportConfig>(DEFAULT_CONFIG);
  const [isGenerating, setIsGenerating] = useState(false);
  const [reports, setReports]           = useState<RecentReport[]>(SEED_REPORTS);

  const activeDef = REPORT_TYPES.find((t) => t.key === activeKey);

  function openModal(key: ReportKey) {
    setActiveKey(key);
    setConfig(DEFAULT_CONFIG);
    modal.open();
  }

  async function handleGenerate() {
    if (!activeKey || !activeDef) return;
    setIsGenerating(true);

    const toastId = toast.loading("Generating report…", { description: activeDef.label });

    try {
      await new Promise<void>((res) => setTimeout(res, 1800));

      const blob     = buildCsvBlob(activeDef.label, config.department, config.dateFrom, config.dateTo);
      const filename = `${activeKey}-report-${Date.now()}.${config.format}`;
      triggerDownload(blob, filename);

      const newReport: RecentReport = {
        id:          crypto.randomUUID(),
        typeKey:     activeKey,
        typeLabel:   activeDef.label,
        generatedAt: `Today, ${nowLabel()}`,
        format:      config.format,
        size:        fakeSizeKb(),
        status:      "ready",
      };
      setReports((prev) => [newReport, ...prev]);

      toast.success("Report ready", {
        id:          toastId,
        description: `${activeDef.label} downloaded as ${FORMAT_LABEL[config.format]}`,
        icon:        "✅",
      });

      modal.close();
    } catch {
      toast.error("Generation failed", {
        id:          toastId,
        description: "Please try again.",
      });
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto">

      {/* ── Header ── */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shrink-0">
            <HiDocumentChartBar size={18} className="text-white" />
          </div>
          <h1 className="text-2xl font-black text-brand-dark dark:text-white tracking-tight">
            Reports
          </h1>
        </div>
        <p className="text-[14px] text-brand-body dark:text-white/55 ml-12">
          Generate and download platform reports in CSV, PDF, or Excel format.
        </p>
      </div>

      {/* ── Report type cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {REPORT_TYPES.map((def) => (
          <ReportCard key={def.key} def={def} onGenerate={openModal} />
        ))}
      </div>

      {/* ── Recent reports table ── */}
      <RecentReportsTable reports={reports} />

      {/* ── Config modal ── */}
      <ConfigModal
        state={modal}
        typeDef={activeDef}
        config={config}
        isGenerating={isGenerating}
        onChange={(patch) => setConfig((c) => ({ ...c, ...patch }))}
        onSubmit={handleGenerate}
      />
    </div>
  );
}
