"use client";

/**
 * ============================================================================
 * QUESTIFY COMPONENT: ProfileLayout
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * Renders profile pages, showcasing XP history, user stats, and details.
 * 
 * WHY IT EXISTS:
 * Gives users an overview of their achievements and academic accomplishments.
 * 
 * HOW IT WORKS (Technical Overview):
 * Integrates tabs containing XPProgress, earned badges grids, and user details.
 * ============================================================================
 */

import React from "react";
import {
  Card,
  CardContent,
  Avatar,
  AvatarImage,
  AvatarFallback,
  Chip,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
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
import { Button } from "@/components/ui/button";
import { HiPencil, HiEnvelope, HiCalendarDays } from "react-icons/hi2";
import { useTranslation } from "react-i18next";

import type { AuthUser } from "@/types/api-response";

export interface ProfileStatCard {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  iconWrapClass: string;
}

export interface ProfileAchievement {
  id: string;
  icon: string;
  name: string;
  desc: string;
  unlocked: boolean;
}

interface ProfileLayoutProps {
  user: AuthUser;
  roleLabel: string;
  roleColor?: "accent" | "success" | "warning" | "danger" | "default";
  subtitle?: string;
  headerExtra?: React.ReactNode;
  statsCards: ProfileStatCard[];
  achievements: ProfileAchievement[];
  editModalTitle?: string;
  editFormContent: React.ReactNode;
  onSave: () => void;
  isSaving?: boolean;
  children?: React.ReactNode;
}

// Turns a raw date string into a friendly "Month Year" (e.g. "June 2026").
const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long" });

// The shared skeleton for every "My Profile" page (admin, teacher, or
// student) — avatar, name, role badge, a row of stat cards, an achievements
// grid, and an "Edit Profile" popup. Each role fills in its own stats and
// extra content, so the overall look stays consistent across the app.
export default function ProfileLayout({
  user,
  roleLabel,
  roleColor = "accent",
  subtitle,
  headerExtra,
  statsCards,
  achievements,
  editModalTitle,
  editFormContent,
  onSave,
  isSaving = false,
  children,
}: ProfileLayoutProps) {
  const editState = useOverlayState();
  const { t } = useTranslation();
  const resolvedEditModalTitle = editModalTitle ?? t("profileLayout.editProfile");
  const initials = `${user.firstName[0] ?? ""}${user.lastName[0] ?? ""}`.toUpperCase();

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6 pb-6">
          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
            <Avatar
              size="lg"
              color={roleColor}
              variant="soft"
              className="!w-20 !h-20 shrink-0"
            >
              {user.avatar && <AvatarImage src={user.avatar} alt={user.fullName} />}
              <AvatarFallback className="text-xl font-bold">{initials}</AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold text-brand-dark dark:text-white">
                  {user.fullName}
                </h1>
                <Chip color={roleColor} variant="soft" size="sm">
                  {roleLabel}
                </Chip>
              </div>
              {subtitle && (
                <p className="text-brand-muted dark:text-white/60 mt-0.5 text-[15px]">
                  {subtitle}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-brand-muted dark:text-white/50">
                <span className="flex items-center gap-1.5">
                  <HiEnvelope className="w-4 h-4 shrink-0" />
                  {user.email}
                </span>
                <span className="flex items-center gap-1.5">
                  <HiCalendarDays className="w-4 h-4 shrink-0" />
                  {t("profileLayout.joined")} {fmtDate(user.createdAt)}
                </span>
              </div>
              {headerExtra && <div className="mt-3">{headerExtra}</div>}
            </div>

            <Button
              onClick={editState.open}
              size="sm"
              variant="outline"
              className="gap-1.5 shrink-0"
            >
              <HiPencil className="w-3.5 h-3.5" />
              {t("profileLayout.editProfile")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((card, i) => (
          <Card key={i}>
            <CardContent className="pt-5 pb-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[13px] font-medium text-brand-muted dark:text-white/50 uppercase tracking-wide">
                    {card.label}
                  </p>
                  <p className="mt-1 text-[25px] font-bold text-brand-dark dark:text-white">
                    {card.value}
                  </p>
                </div>
                <div className={`p-2.5 rounded-lg shrink-0 ${card.iconWrapClass}`}>
                  {card.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Role-specific content */}
      {children}

      {/* Achievements — omitted when caller supplies an empty array */}
      {achievements.length > 0 && (
      <Card>
        <CardContent className="pt-5 pb-5">
          <h2 className="font-semibold text-brand-dark dark:text-white mb-4">
            {t("profileLayout.achievements")}
          </h2>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
            {achievements.map((a) => (
              <Tooltip key={a.id}>
                <TooltipTrigger>
                  <div
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border cursor-default transition-all
                      border-brand-border dark:border-white/8
                      ${
                        a.unlocked
                          ? "bg-white dark:bg-slate-800/50 hover:border-brand-purple/40 dark:hover:border-brand-purple/40"
                          : "bg-brand-surface dark:bg-slate-900/30 opacity-40 grayscale"
                      }`}
                  >
                    <span className="text-2xl leading-none">{a.icon}</span>
                    <span className="text-[10px] font-medium text-brand-dark dark:text-white text-center leading-tight">
                      {a.name}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  {a.unlocked ? a.desc : `🔒 ${a.desc}`}
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </CardContent>
      </Card>
      )}

      {/* Edit Profile Modal */}
      <ModalRoot state={editState}>
        <ModalBackdrop />
        <ModalContainer size="md" placement="center">
          <ModalDialog>
            <ModalHeader>
              <ModalHeading>{resolvedEditModalTitle}</ModalHeading>
              <ModalCloseTrigger />
            </ModalHeader>
            <ModalBody>{editFormContent}</ModalBody>
            <ModalFooter>
              <ModalCloseTrigger>
                <Button variant="outline" disabled={isSaving}>
                  {t("profileLayout.cancel")}
                </Button>
              </ModalCloseTrigger>
              <Button onClick={onSave} disabled={isSaving}>
                {isSaving ? t("profileLayout.saving") : t("profileLayout.saveChanges")}
              </Button>
            </ModalFooter>
          </ModalDialog>
        </ModalContainer>
      </ModalRoot>
    </div>
  );
}
