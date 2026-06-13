import { useMemo } from "react";
import { trpc } from "@/providers/trpc";
import { Link } from "react-router";
import {
  DndContext,
  type DragEndEvent,
  type DragStartEvent,
  useSensor,
  useSensors,
  PointerSensor,
  closestCorners,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Mail,
  Phone,
  GripVertical,
} from "lucide-react";
import type { Lead } from "@db/schema";

const columns = [
  { id: "NEW", label: "New", color: "border-t-blue-500" },
  { id: "CONTACTED", label: "Contacted", color: "border-t-orange-500" },
  { id: "NEGOTIATION", label: "Negotiation", color: "border-t-purple-500" },
  { id: "WON", label: "Won", color: "border-t-[#D4FF00]" },
  { id: "LOST", label: "Lost", color: "border-t-red-500" },
] as const;

function formatCurrency(value: string | number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(Number(value));
}

function SortableLeadCard({ lead }: { lead: Lead }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lead.id.toString(), data: { lead } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-[#1A1A1A] border border-[#27272A] rounded-xl p-4 hover:border-[#3F3F46] hover:bg-[#1E1E1E] transition-all group cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <div
          {...attributes}
          {...listeners}
          className="p-1 rounded hover:bg-[#27272A] cursor-grab active:cursor-grabbing"
        >
          <GripVertical size={14} className="text-[#3F3F46]" />
        </div>
        <span className="text-[#D4FF00] text-sm font-semibold font-display">
          {formatCurrency(lead.value)}
        </span>
      </div>
      <Link to={`/leads/${lead.id}`}>
        <h4 className="text-sm font-medium text-white group-hover:text-[#D4FF00] transition-colors">
          {lead.name}
        </h4>
        <p className="text-xs text-[#52525B] mt-1">{lead.company}</p>
        <div className="flex items-center gap-3 mt-3 text-[#52525B]">
          {lead.email && <Mail size={12} />}
          {lead.phone && <Phone size={12} />}
        </div>
      </Link>
    </div>
  );
}

export default function Pipeline() {
  const utils = trpc.useUtils();
  const { data: pipeline, isLoading } = trpc.lead.pipelineData.useQuery();
  const updateStatus = trpc.lead.updateStatus.useMutation({
    onSuccess: () => {
      utils.lead.pipelineData.invalidate();
      utils.lead.dashboardStats.invalidate();
    },
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  const leadsByColumn = useMemo(() => {
    if (!pipeline) return {} as Record<string, Lead[]>;
    return pipeline as unknown as Record<string, Lead[]>;
  }, [pipeline]);

  const handleDragStart = (_event: DragStartEvent) => {
    // Could show drag preview here
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const leadId = Number(active.id);
    const newStatus = over.id as string;

    if (columns.some((c) => c.id === newStatus)) {
      const lead = active.data.current?.lead as Lead;
      if (lead && lead.status !== newStatus) {
        updateStatus.mutate({ id: leadId, status: newStatus as Lead["status"] });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">Pipeline</h1>
          <p className="text-sm text-[#52525B] mt-1">
            Drag and drop leads between stages
          </p>
        </div>
        <div className="grid grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-10 rounded-xl bg-[#18181B]" />
              {Array.from({ length: 3 }).map((_, j) => (
                <Skeleton key={j} className="h-32 rounded-xl bg-[#1A1A1A]" />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Pipeline</h1>
          <p className="text-sm text-[#52525B] mt-1">
            Drag and drop leads between stages to update their status
          </p>
        </div>
        <div className="flex items-center gap-4 text-sm text-[#52525B]">
          {columns.map((col) => {
            const count = leadsByColumn[col.id]?.length || 0;
            return (
              <div key={col.id} className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${col.color.replace("border-t-", "bg-")}`} />
                <span>{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Kanban Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {columns.map((column) => {
            const columnLeads = leadsByColumn[column.id] || [];
            return (
              <div
                key={column.id}
                className={`bg-[#0D0D0D] rounded-xl border border-[#27272A] border-t-2 ${column.color} flex flex-col max-h-[calc(100vh-200px)]`}
              >
                {/* Column Header */}
                <div className="px-4 py-3 flex items-center justify-between border-b border-[#27272A]/50">
                  <h3 className="text-sm font-medium text-white">{column.label}</h3>
                  <span className="text-xs text-[#52525B] bg-[#1A1A1A] px-2 py-0.5 rounded-full">
                    {columnLeads.length}
                  </span>
                </div>

                {/* Column Body - Droppable */}
                <div className="flex-1 p-3 overflow-y-auto scrollbar-thin min-h-[200px]">
                  <SortableContext
                    items={columnLeads.map((l) => l.id.toString())}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-2">
                      {columnLeads.map((lead) => (
                        <SortableLeadCard key={lead.id} lead={lead} />
                      ))}
                    </div>
                  </SortableContext>

                  {columnLeads.length === 0 && (
                    <div className="text-center py-8 text-[#3F3F46] text-xs">
                      Drop leads here
                    </div>
                  )}
                </div>

                {/* Column Footer */}
                <div className="px-4 py-2 border-t border-[#27272A]/50">
                  <div className="flex items-center justify-between text-xs text-[#52525B]">
                    <span>Total</span>
                    <span className="text-[#D4FF00] font-medium font-display">
                      {formatCurrency(
                        columnLeads.reduce((sum, l) => sum + Number(l.value), 0)
                      )}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </DndContext>
    </div>
  );
}
