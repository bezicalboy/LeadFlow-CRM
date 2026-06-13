import { trpc } from "@/providers/trpc";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { PipelinePreview } from "@/components/dashboard/PipelinePreview";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DollarSign,
  Users,
  Target,
  ClipboardCheck,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export default function Dashboard() {
  const { data: stats, isLoading } = trpc.lead.dashboardStats.useQuery();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
          <p className="text-sm text-[#52525B] mt-1">
            Overview of your sales pipeline and performance
          </p>
        </div>
        <span className="text-xs text-[#52525B] uppercase tracking-widest">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </span>
      </div>

      {/* Metrics Strip */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl bg-[#18181B] border border-[#27272A]" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Revenue"
            value={formatCurrency(stats?.wonRevenue || 0)}
            trend="+12% from last month"
            trendUp={true}
            icon={<DollarSign size={18} />}
          />
          <MetricCard
            title="Active Leads"
            value={String(stats?.totalLeads || 0)}
            trend={`${stats?.newLeads || 0} new this week`}
            trendUp={true}
            icon={<Users size={18} />}
          />
          <MetricCard
            title="Win Rate"
            value={
              stats
                ? `${Math.round(
                    (stats.wonDeals /
                      Math.max(stats.wonDeals + stats.lostDeals, 1)) *
                      100
                  )}%`
                : "0%"
            }
            trend={`${stats?.wonDeals || 0} won / ${stats?.lostDeals || 0} lost`}
            trendUp={true}
            icon={<Target size={18} />}
          />
          <MetricCard
            title="In Negotiation"
            value={String(stats?.negotiationLeads || 0)}
            trend={formatCurrency(stats?.estimatedRevenue || 0)}
            trendUp={true}
            icon={<ClipboardCheck size={18} />}
          />
        </div>
      )}

      {/* Second row: Pipeline Preview + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PipelinePreview />
        </div>
        <div>
          <ActivityFeed />
        </div>
      </div>

      {/* Status Breakdown */}
      {isLoading ? (
        <Skeleton className="h-48 rounded-xl bg-[#18181B] border border-[#27272A]" />
      ) : (
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Pipeline Breakdown</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: "New", value: stats?.newLeads || 0, color: "bg-blue-500", icon: TrendingUp },
              { label: "Contacted", value: stats?.contactedLeads || 0, color: "bg-orange-500", icon: TrendingUp },
              { label: "Negotiation", value: stats?.negotiationLeads || 0, color: "bg-purple-500", icon: TrendingUp },
              { label: "Won", value: stats?.wonDeals || 0, color: "bg-[#D4FF00]", icon: TrendingUp },
              { label: "Lost", value: stats?.lostDeals || 0, color: "bg-red-500", icon: TrendingDown },
              { label: "Total", value: stats?.totalLeads || 0, color: "bg-white", icon: TrendingUp },
            ].map((item) => (
              <div
                key={item.label}
                className="bg-[#121212] rounded-xl p-4 text-center hover:bg-[#1A1A1A] transition-colors"
              >
                <div className={`w-2 h-2 rounded-full ${item.color} mx-auto mb-2`} />
                <p className="text-2xl font-semibold text-white">{item.value}</p>
                <p className="text-xs text-[#52525B] mt-1">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
