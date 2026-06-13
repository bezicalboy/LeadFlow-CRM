import { ChevronDown, Loader2 } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { toast } from "sonner";
import type { LeadStatus } from "@db/schema";
import {
  ALL_LEAD_STATUSES,
  getStatusLabel,
  statusConfig,
} from "@/lib/lead-status";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type LeadStatusSelectProps = {
  leadId: number;
  status: LeadStatus;
  onStatusChange?: () => void;
  size?: "sm" | "md";
};

export function LeadStatusSelect({
  leadId,
  status,
  onStatusChange,
  size = "sm",
}: LeadStatusSelectProps) {
  const utils = trpc.useUtils();
  const colors = statusConfig[status];

  const updateStatus = trpc.lead.updateStatus.useMutation({
    onSuccess: (_data, variables) => {
      toast.success(`Status → ${getStatusLabel(variables.status)}`);
      utils.lead.list.invalidate();
      utils.lead.getById.invalidate({ id: leadId });
      utils.lead.pipelineData.invalidate();
      utils.lead.dashboardStats.invalidate();
      onStatusChange?.();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update status");
    },
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          disabled={updateStatus.isPending}
          onClick={(e) => e.stopPropagation()}
          className={cn(
            "inline-flex items-center gap-1 rounded-full border font-medium transition-all",
            "hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-[#D4FF00]/30",
            colors.bg,
            colors.text,
            colors.border,
            size === "sm" ? "px-2.5 py-0.5 text-xs" : "px-3 py-1 text-sm",
          )}
        >
          {updateStatus.isPending ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            getStatusLabel(status)
          )}
          <ChevronDown size={12} className="opacity-60" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="bg-[#1A1A1A] border-[#27272A] min-w-[160px]"
        onClick={(e) => e.stopPropagation()}
      >
        <DropdownMenuLabel className="text-[#52525B] text-xs font-normal">
          Change status
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-[#27272A]" />
        {ALL_LEAD_STATUSES.map((option) => {
          const optionColors = statusConfig[option];
          const isCurrent = option === status;

          return (
            <DropdownMenuItem
              key={option}
              disabled={isCurrent || updateStatus.isPending}
              onClick={() => updateStatus.mutate({ id: leadId, status: option })}
              className={cn(
                "flex items-center gap-2 cursor-pointer focus:bg-[#27272A]",
                isCurrent ? "opacity-50" : "text-[#A1A1AA] focus:text-white",
              )}
            >
              <span className={cn("h-2 w-2 rounded-full shrink-0", optionColors.dot)} />
              {getStatusLabel(option)}
              {isCurrent && (
                <span className="ml-auto text-[10px] text-[#52525B]">Current</span>
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
