import { Check, Loader2, Trophy, XCircle } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { toast } from "sonner";
import type { LeadStatus } from "@db/schema";
import {
  getPipelineIndex,
  getStatusLabel,
  OUTCOME_STAGES,
  PIPELINE_STAGES,
  statusConfig,
} from "@/lib/lead-status";
import { cn } from "@/lib/utils";

type LeadStatusPipelineProps = {
  leadId: number;
  currentStatus: LeadStatus;
  onStatusChange?: () => void;
  compact?: boolean;
};

export function LeadStatusPipeline({
  leadId,
  currentStatus,
  onStatusChange,
  compact = false,
}: LeadStatusPipelineProps) {
  const utils = trpc.useUtils();

  const updateStatus = trpc.lead.updateStatus.useMutation({
    onSuccess: (_data, variables) => {
      toast.success(`Status updated to ${getStatusLabel(variables.status)}`);
      utils.lead.getById.invalidate({ id: leadId });
      utils.lead.list.invalidate();
      utils.lead.pipelineData.invalidate();
      utils.lead.dashboardStats.invalidate();
      onStatusChange?.();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update status");
    },
  });

  const handleChange = (status: LeadStatus) => {
    if (status === currentStatus || updateStatus.isPending) return;
    updateStatus.mutate({ id: leadId, status });
  };

  const currentIndex = getPipelineIndex(currentStatus);
  const isOutcome = currentStatus === "WON" || currentStatus === "LOST";

  return (
    <div
      className={cn(
        "rounded-xl border border-[#27272A] bg-[#121212]",
        compact ? "p-4" : "p-5",
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-[#52525B]">
            Deal Pipeline
          </p>
          {!compact && (
            <p className="text-sm text-[#71717A] mt-0.5">
              Click a stage to move this lead forward
            </p>
          )}
        </div>
        {updateStatus.isPending && (
          <Loader2 size={16} className="animate-spin text-[#D4FF00]" />
        )}
      </div>

      {/* Main pipeline stages */}
      <div className="flex items-center gap-0">
        {PIPELINE_STAGES.map((stage, index) => {
          const isActive = currentStatus === stage.value;
          const isCompleted = !isOutcome && currentIndex > index;
          const colors = statusConfig[stage.value];

          return (
            <div key={stage.value} className="flex flex-1 items-center min-w-0">
              <button
                type="button"
                onClick={() => handleChange(stage.value)}
                disabled={updateStatus.isPending}
                className={cn(
                  "group flex flex-1 flex-col items-center gap-2 rounded-lg px-2 py-3 transition-all",
                  "hover:bg-[#1A1A1A] disabled:opacity-50 disabled:cursor-not-allowed",
                  isActive && "bg-[#1A1A1A]",
                )}
              >
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all",
                    isActive
                      ? `${colors.border} ${colors.bg} ring-2 ring-offset-2 ring-offset-[#121212] ${stage.value === "WON" ? "ring-[#D4FF00]/40" : "ring-white/10"}`
                      : isCompleted
                        ? "border-[#D4FF00]/50 bg-[#D4FF00]/10"
                        : "border-[#3F3F46] bg-[#0A0A0A] group-hover:border-[#52525B]",
                  )}
                >
                  {isCompleted ? (
                    <Check size={16} className="text-[#D4FF00]" />
                  ) : (
                    <span
                      className={cn(
                        "h-2.5 w-2.5 rounded-full",
                        isActive ? colors.dot : "bg-[#3F3F46] group-hover:bg-[#52525B]",
                      )}
                    />
                  )}
                </div>
                <span
                  className={cn(
                    "text-xs font-medium text-center leading-tight",
                    isActive ? colors.text : isCompleted ? "text-[#A1A1AA]" : "text-[#52525B]",
                  )}
                >
                  {stage.label}
                </span>
              </button>

              {index < PIPELINE_STAGES.length - 1 && (
                <div
                  className={cn(
                    "h-0.5 w-full min-w-[12px] max-w-[40px] shrink rounded-full transition-colors",
                    !isOutcome && currentIndex > index ? "bg-[#D4FF00]/40" : "bg-[#27272A]",
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Outcome actions */}
      <div className="mt-4 flex items-center gap-3 border-t border-[#27272A] pt-4">
        <span className="text-xs text-[#52525B] shrink-0">Close deal:</span>
        <div className="flex flex-1 gap-2">
          {OUTCOME_STAGES.map((stage) => {
            const isActive = currentStatus === stage.value;
            const colors = statusConfig[stage.value];
            const Icon = stage.value === "WON" ? Trophy : XCircle;

            return (
              <button
                key={stage.value}
                type="button"
                onClick={() => handleChange(stage.value)}
                disabled={updateStatus.isPending}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  isActive
                    ? `${colors.bg} ${colors.text} ${colors.border}`
                    : "border-[#27272A] text-[#71717A] hover:border-[#3F3F46] hover:bg-[#1A1A1A] hover:text-white",
                )}
              >
                <Icon size={16} />
                Mark as {stage.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
