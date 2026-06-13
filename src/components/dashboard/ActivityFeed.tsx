import { formatDistanceToNow } from "date-fns";
import { trpc } from "@/providers/trpc";
import { Skeleton } from "@/components/ui/skeleton";
import {
  UserPlus,
  Pencil,
  Trash2,
  ArrowRightLeft,
  StickyNote,
  CheckCircle,
  Trophy,
} from "lucide-react";

const actionConfig = {
  CREATED: { icon: UserPlus, color: "text-[#D4FF00]", bg: "bg-[#D4FF00]/10" },
  UPDATED: { icon: Pencil, color: "text-blue-400", bg: "bg-blue-400/10" },
  DELETED: { icon: Trash2, color: "text-red-400", bg: "bg-red-400/10" },
  STATUS_CHANGED: { icon: ArrowRightLeft, color: "text-orange-400", bg: "bg-orange-400/10" },
  NOTE_ADDED: { icon: StickyNote, color: "text-purple-400", bg: "bg-purple-400/10" },
  TASK_COMPLETED: { icon: CheckCircle, color: "text-green-400", bg: "bg-green-400/10" },
  DEAL_WON: { icon: Trophy, color: "text-[#D4FF00]", bg: "bg-[#D4FF00]/10" },
};

export function ActivityFeed() {
  const { data: activities, isLoading } = trpc.lead.recentActivity.useQuery({ limit: 10 });

  if (isLoading) {
    return (
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="w-8 h-8 rounded-full bg-[#27272A]" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-48 bg-[#27272A]" />
                <Skeleton className="h-3 w-24 bg-[#27272A]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
        <div className="text-center py-8 text-[#52525B]">
          <p className="text-sm">No recent activity</p>
          <p className="text-xs mt-1">Activity will appear here as you manage leads</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
      <div className="space-y-3 max-h-[400px] overflow-y-auto scrollbar-thin pr-2">
        {activities.map((activity) => {
          const config = actionConfig[activity.action] || actionConfig.CREATED;
          const Icon = config.icon;
          return (
            <div
              key={activity.id}
              className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-[#121212] transition-colors"
            >
              <div
                className={`w-8 h-8 rounded-full ${config.bg} flex items-center justify-center flex-shrink-0`}
              >
                <Icon size={14} className={config.color} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">{activity.description}</p>
                <p className="text-xs text-[#52525B]">
                  {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
