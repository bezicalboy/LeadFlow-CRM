import { useState } from "react";
import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckSquare,
  Circle,
  CircleCheck,
  Clock,
  Trash2,
  Filter,
  ArrowLeft,
} from "lucide-react";

export default function Tasks() {
  const [filter, setFilter] = useState<string>("ALL");
  const utils = trpc.useUtils();

  const completed = filter === "COMPLETED" ? true : filter === "PENDING" ? false : undefined;

  const { data: tasks, isLoading } = trpc.task.list.useQuery(
    completed !== undefined ? { completed } : undefined
  );

  const toggleTask = trpc.task.toggleComplete.useMutation({
    onSuccess: () => utils.task.list.invalidate(),
  });

  const deleteTask = trpc.task.delete.useMutation({
    onSuccess: () => utils.task.list.invalidate(),
  });

  const pendingCount = tasks?.filter((t) => !t.completed).length || 0;
  const completedCount = tasks?.filter((t) => t.completed).length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Tasks</h1>
          <p className="text-sm text-[#52525B] mt-1">
            Manage your follow-ups and to-dos
          </p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#18181B] rounded-full border border-[#27272A]">
            <Circle size={12} className="text-orange-400" />
            <span className="text-[#A1A1AA]">{pendingCount} pending</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#18181B] rounded-full border border-[#27272A]">
            <CircleCheck size={12} className="text-[#D4FF00]" />
            <span className="text-[#A1A1AA]">{completedCount} done</span>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-3">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-44 bg-[#121212] border-[#27272A] text-white">
            <Filter size={14} className="mr-2 text-[#52525B]" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#1A1A1A] border-[#27272A]">
            <SelectItem value="ALL">All Tasks</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tasks List */}
      <div className="glass-card overflow-hidden">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-lg bg-[#1A1A1A]" />
            ))}
          </div>
        ) : !tasks || tasks.length === 0 ? (
          <div className="text-center py-16 text-[#52525B]">
            <CheckSquare size={48} className="mx-auto mb-3 opacity-30" />
            <p className="text-lg font-medium">No tasks found</p>
            <p className="text-sm mt-1">
              {filter !== "ALL"
                ? "Try changing your filter"
                : "Tasks will appear here when you add them to leads"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#27272A]/50">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`flex items-center gap-4 p-4 hover:bg-[#121212]/50 transition-colors ${
                  task.completed ? "opacity-50" : ""
                }`}
              >
                <button
                  onClick={() => toggleTask.mutate({ id: task.id })}
                  className={`flex-shrink-0 transition-colors ${
                    task.completed
                      ? "text-[#D4FF00]"
                      : "text-[#52525B] hover:text-[#D4FF00]"
                  }`}
                >
                  {task.completed ? <CircleCheck size={22} /> : <Circle size={22} />}
                </button>

                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium ${
                      task.completed ? "text-[#52525B] line-through" : "text-white"
                    }`}
                  >
                    {task.title}
                  </p>
                  {task.description && (
                    <p className="text-xs text-[#52525B] mt-0.5">{task.description}</p>
                  )}
                  <div className="flex items-center gap-3 mt-1.5">
                    {task.dueDate && (
                      <div className="flex items-center gap-1">
                        <Clock size={10} className="text-[#52525B]" />
                        <span className="text-[10px] text-[#52525B]">
                          {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    <Link
                      to={`/leads/${task.leadId}`}
                      className="text-[10px] text-[#52525B] hover:text-[#D4FF00] transition-colors flex items-center gap-1"
                    >
                      <ArrowLeft size={10} />
                      View Lead
                    </Link>
                  </div>
                </div>

                <button
                  onClick={() => deleteTask.mutate({ id: task.id })}
                  className="p-2 rounded-lg hover:bg-red-500/10 text-[#52525B] hover:text-red-400 transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
