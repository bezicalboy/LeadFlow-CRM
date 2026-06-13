import type { LeadStatus } from "@db/schema";

export const PIPELINE_STAGES: {
  value: LeadStatus;
  label: string;
  shortLabel: string;
}[] = [
  { value: "NEW", label: "New", shortLabel: "New" },
  { value: "CONTACTED", label: "Contacted", shortLabel: "Contacted" },
  { value: "NEGOTIATION", label: "Negotiation", shortLabel: "Negotiation" },
];

export const OUTCOME_STAGES: {
  value: LeadStatus;
  label: string;
}[] = [
  { value: "WON", label: "Won" },
  { value: "LOST", label: "Lost" },
];

export const ALL_LEAD_STATUSES: LeadStatus[] = [
  "NEW",
  "CONTACTED",
  "NEGOTIATION",
  "WON",
  "LOST",
];

export const statusConfig: Record<
  LeadStatus,
  { bg: string; text: string; border: string; dot: string }
> = {
  NEW: {
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    border: "border-blue-500/30",
    dot: "bg-blue-400",
  },
  CONTACTED: {
    bg: "bg-orange-500/10",
    text: "text-orange-400",
    border: "border-orange-500/30",
    dot: "bg-orange-400",
  },
  NEGOTIATION: {
    bg: "bg-purple-500/10",
    text: "text-purple-400",
    border: "border-purple-500/30",
    dot: "bg-purple-400",
  },
  WON: {
    bg: "bg-[#D4FF00]/10",
    text: "text-[#D4FF00]",
    border: "border-[#D4FF00]/30",
    dot: "bg-[#D4FF00]",
  },
  LOST: {
    bg: "bg-red-500/10",
    text: "text-red-400",
    border: "border-red-500/30",
    dot: "bg-red-400",
  },
};

export function getStatusLabel(status: LeadStatus): string {
  return (
    PIPELINE_STAGES.find((s) => s.value === status)?.label ??
    OUTCOME_STAGES.find((s) => s.value === status)?.label ??
    status
  );
}

export function getPipelineIndex(status: LeadStatus): number {
  return PIPELINE_STAGES.findIndex((s) => s.value === status);
}
