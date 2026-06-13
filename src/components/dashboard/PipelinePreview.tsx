import { trpc } from "@/providers/trpc";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router";

const statusColors: Record<string, { bg: string; text: string }> = {
  NEW: { bg: "bg-blue-500/10", text: "text-blue-400" },
  CONTACTED: { bg: "bg-orange-500/10", text: "text-orange-400" },
  NEGOTIATION: { bg: "bg-purple-500/10", text: "text-purple-400" },
  WON: { bg: "bg-[#D4FF00]/10", text: "text-[#D4FF00]" },
  LOST: { bg: "bg-red-500/10", text: "text-red-400" },
};

interface PipelineDeal {
  name: string;
  company: string;
  value: string | number;
  status: string;
}

function formatCurrency(value: string | number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(value));
}

export function PipelinePreview() {
  const { data: pipeline, isLoading } = trpc.lead.pipelineData.useQuery();

  if (isLoading) {
    return (
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-6 w-32 bg-[#27272A]" />
          <Skeleton className="h-4 w-16 bg-[#27272A]" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[4/5] rounded-2xl bg-[#1A1A1A]" />
          ))}
        </div>
      </div>
    );
  }

  // Flatten pipeline data
  const allDeals: PipelineDeal[] = [];
  if (pipeline) {
    for (const statusList of Object.values(pipeline)) {
      if (Array.isArray(statusList)) {
        for (const deal of statusList) {
          allDeals.push(deal as unknown as PipelineDeal);
        }
      }
    }
  }

  const deals = allDeals.slice(0, 10);

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Active Pipeline</h3>
        <Link
          to="/pipeline"
          className="text-sm text-[#52525B] hover:text-[#D4FF00] transition-colors"
        >
          View all
        </Link>
      </div>

      {deals.length === 0 ? (
        <div className="text-center py-12 text-[#52525B]">
          <p className="text-sm">No leads in your pipeline yet</p>
          <Link to="/leads" className="text-[#D4FF00] text-sm hover:underline mt-1 inline-block">
            Add your first lead
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {deals.map((deal, index) => {
            const colors = statusColors[deal.status] || statusColors.NEW;

            return (
              <div
                key={index}
                className="aspect-[4/5] rounded-2xl bg-[#1A1A1A] border border-[#27272A] p-4 flex flex-col justify-between hover:border-[#3F3F46] hover:bg-[#1E1E1E] transition-all duration-200 group cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <span className="text-[#D4FF00] text-sm font-semibold font-display">
                    {formatCurrency(deal.value)}
                  </span>
                  <span
                    className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${colors.bg} ${colors.text}`}
                  >
                    {deal.status}
                  </span>
                </div>
                <div>
                  <p className="text-white text-sm font-medium truncate">{deal.name}</p>
                  <p className="text-[#52525B] text-xs mt-0.5">{deal.company}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
