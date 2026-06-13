import { useState } from "react";
import { useParams, Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Mail,
  Phone,
  Building2,
  Calendar,
  StickyNote,
  CheckSquare,
  Plus,
  Trash2,
  Pencil,
  Save,
  X,
  Circle,
  CircleCheck,
  Clock,
} from "lucide-react";
import { LeadStatusPipeline } from "@/components/leads/LeadStatusPipeline";
import type { LeadStatus } from "@db/schema";

function formatCurrency(value: string | number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(Number(value));
}

export default function LeadDetail() {
  const { id } = useParams<{ id: string }>();
  const leadId = Number(id);
  const utils = trpc.useUtils();

  const { data: lead, isLoading } = trpc.lead.getById.useQuery({ id: leadId });

  // Notes state
  const [newNote, setNewNote] = useState("");
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [editNoteContent, setEditNoteContent] = useState("");

  // Tasks state
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [taskDueDate, setTaskDueDate] = useState("");

  // Mutations
  const createNote = trpc.note.create.useMutation({
    onSuccess: () => {
      utils.lead.getById.invalidate({ id: leadId });
      setNewNote("");
    },
  });

  const updateNote = trpc.note.update.useMutation({
    onSuccess: () => {
      utils.lead.getById.invalidate({ id: leadId });
      setEditingNoteId(null);
      setEditNoteContent("");
    },
  });

  const deleteNote = trpc.note.delete.useMutation({
    onSuccess: () => utils.lead.getById.invalidate({ id: leadId }),
  });

  const createTask = trpc.task.create.useMutation({
    onSuccess: () => {
      utils.lead.getById.invalidate({ id: leadId });
      setTaskTitle("");
      setTaskDesc("");
      setTaskDueDate("");
      setShowTaskForm(false);
    },
  });

  const toggleTask = trpc.task.toggleComplete.useMutation({
    onSuccess: () => utils.lead.getById.invalidate({ id: leadId }),
  });

  const deleteTask = trpc.task.delete.useMutation({
    onSuccess: () => utils.lead.getById.invalidate({ id: leadId }),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32 bg-[#27272A]" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-64 rounded-xl bg-[#18181B] border border-[#27272A]" />
          </div>
          <Skeleton className="h-96 rounded-xl bg-[#18181B] border border-[#27272A]" />
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-[#52525B] text-lg">Lead not found</p>
        <Link
          to="/leads"
          className="mt-4 text-[#D4FF00] text-sm hover:underline"
        >
          Back to leads
        </Link>
      </div>
    );
  }

  const notes = Array.isArray(lead.notes) ? lead.notes : [];
  const tasks = lead.tasks || [];
  const completedTasks = tasks.filter((t) => t.completed);
  const pendingTasks = tasks.filter((t) => !t.completed);

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link
        to="/leads"
        className="inline-flex items-center gap-2 text-sm text-[#52525B] hover:text-[#D4FF00] transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Leads
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lead Info - Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Lead Header Card */}
          <div className="glass-card p-6">
            <div className="mb-4">
              <h1 className="text-2xl font-semibold text-white">{lead.name}</h1>
              <div className="flex items-center gap-2 mt-2">
                <Building2 size={14} className="text-[#52525B]" />
                <span className="text-sm text-[#A1A1AA]">{lead.company}</span>
              </div>
            </div>

            <LeadStatusPipeline
              leadId={leadId}
              currentStatus={lead.status as LeadStatus}
            />

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-[#27272A]">
              <div>
                <p className="text-xs text-[#52525B] uppercase tracking-wider mb-1">
                  Deal Value
                </p>
                <p className="text-xl font-semibold text-[#D4FF00] font-display">
                  {formatCurrency(lead.value)}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#52525B] uppercase tracking-wider mb-1">
                  Email
                </p>
                <div className="flex items-center gap-1.5">
                  <Mail size={14} className="text-[#52525B]" />
                  <p className="text-sm text-[#A1A1AA] truncate">{lead.email}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-[#52525B] uppercase tracking-wider mb-1">
                  Phone
                </p>
                <div className="flex items-center gap-1.5">
                  <Phone size={14} className="text-[#52525B]" />
                  <p className="text-sm text-[#A1A1AA]">{lead.phone || "—"}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-[#52525B] uppercase tracking-wider mb-1">
                  Created
                </p>
                <div className="flex items-center gap-1.5">
                  <Calendar size={14} className="text-[#52525B]" />
                  <p className="text-sm text-[#A1A1AA]">
                    {new Date(lead.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {typeof lead.notes !== "object" && lead.notes && (
              <div className="mt-6 pt-6 border-t border-[#27272A]">
                <p className="text-xs text-[#52525B] uppercase tracking-wider mb-2">
                  Notes
                </p>
                <p className="text-sm text-[#A1A1AA] leading-relaxed">{lead.notes as string}</p>
              </div>
            )}
          </div>

          {/* Tasks Section */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CheckSquare size={18} className="text-[#D4FF00]" />
                <h2 className="text-lg font-semibold text-white">Tasks</h2>
                <span className="text-xs text-[#52525B] bg-[#1A1A1A] px-2 py-0.5 rounded-full">
                  {tasks.length}
                </span>
              </div>
              <Button
                size="sm"
                onClick={() => setShowTaskForm(true)}
                className="bg-[#D4FF00] text-black hover:bg-[#c5f000] rounded-full text-xs h-8"
              >
                <Plus size={14} className="mr-1" />
                Add Task
              </Button>
            </div>

            {showTaskForm && (
              <div className="bg-[#121212] rounded-xl p-4 mb-4 space-y-3">
                <Input
                  placeholder="Task title"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="bg-[#1A1A1A] border-[#27272A] text-white placeholder-[#3F3F46] focus:border-[#D4FF00]"
                />
                <Textarea
                  placeholder="Description (optional)"
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  rows={2}
                  className="bg-[#1A1A1A] border-[#27272A] text-white placeholder-[#3F3F46] focus:border-[#D4FF00] resize-none"
                />
                <div className="flex items-center gap-3">
                  <Input
                    type="date"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="bg-[#1A1A1A] border-[#27272A] text-white focus:border-[#D4FF00] w-40"
                  />
                  <div className="flex gap-2 ml-auto">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowTaskForm(false)}
                      className="text-[#52525B] hover:text-white"
                    >
                      <X size={14} />
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        if (!taskTitle.trim()) return;
                        createTask.mutate({
                          leadId,
                          title: taskTitle,
                          description: taskDesc || undefined,
                          dueDate: taskDueDate || undefined,
                        });
                      }}
                      disabled={!taskTitle.trim() || createTask.isPending}
                      className="bg-[#D4FF00] text-black hover:bg-[#c5f000]"
                    >
                      <Save size={14} className="mr-1" />
                      Save
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Pending Tasks */}
            {pendingTasks.length > 0 && (
              <div className="space-y-2 mb-4">
                {pendingTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 p-3 bg-[#121212] rounded-lg group hover:bg-[#1A1A1A] transition-colors"
                  >
                    <button
                      onClick={() => toggleTask.mutate({ id: task.id })}
                      className="text-[#52525B] hover:text-[#D4FF00] transition-colors"
                    >
                      <Circle size={18} />
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white">{task.title}</p>
                      {task.description && (
                        <p className="text-xs text-[#52525B] mt-0.5">{task.description}</p>
                      )}
                      {task.dueDate && (
                        <div className="flex items-center gap-1 mt-1">
                          <Clock size={10} className="text-[#52525B]" />
                          <span className="text-[10px] text-[#52525B]">
                            {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => deleteTask.mutate({ id: task.id })}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded hover:bg-red-500/10 text-[#52525B] hover:text-red-400 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Completed Tasks */}
            {completedTasks.length > 0 && (
              <div>
                <p className="text-xs text-[#52525B] uppercase tracking-wider mb-2">
                  Completed ({completedTasks.length})
                </p>
                <div className="space-y-2 opacity-60">
                  {completedTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center gap-3 p-3 bg-[#121212] rounded-lg"
                    >
                      <button
                        onClick={() => toggleTask.mutate({ id: task.id })}
                        className="text-[#D4FF00]"
                      >
                        <CircleCheck size={18} />
                      </button>
                      <div className="flex-1">
                        <p className="text-sm text-[#52525B] line-through">
                          {task.title}
                        </p>
                      </div>
                      <button
                        onClick={() => deleteTask.mutate({ id: task.id })}
                        className="p-1.5 rounded hover:bg-red-500/10 text-[#52525B] hover:text-red-400 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tasks.length === 0 && (
              <div className="text-center py-8 text-[#52525B]">
                <CheckSquare size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">No tasks yet</p>
                <p className="text-xs mt-1">Add tasks to track follow-ups</p>
              </div>
            )}
          </div>
        </div>

        {/* Notes - Right Column */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <StickyNote size={18} className="text-[#D4FF00]" />
            <h2 className="text-lg font-semibold text-white">Notes</h2>
            <span className="text-xs text-[#52525B] bg-[#1A1A1A] px-2 py-0.5 rounded-full">
              {notes.length}
            </span>
          </div>

          {/* Add Note */}
          <div className="mb-4">
            <Textarea
              placeholder="Add a note..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              rows={3}
              className="bg-[#121212] border-[#27272A] text-white placeholder-[#3F3F46] focus:border-[#D4FF00] focus:ring-[#D4FF00]/20 resize-none"
            />
            <Button
              size="sm"
              onClick={() => {
                if (!newNote.trim()) return;
                createNote.mutate({ leadId, content: newNote });
              }}
              disabled={!newNote.trim() || createNote.isPending}
              className="mt-2 bg-[#D4FF00] text-black hover:bg-[#c5f000] rounded-full text-xs"
            >
              <Plus size={14} className="mr-1" />
              Add Note
            </Button>
          </div>

          {/* Notes List */}
          <div className="space-y-3 max-h-[calc(100vh-400px)] overflow-y-auto scrollbar-thin pr-2">
            {notes.map((note) => (
              <div
                key={note.id}
                className="bg-[#121212] rounded-lg p-3 group hover:bg-[#1A1A1A] transition-colors"
              >
                {editingNoteId === note.id ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editNoteContent}
                      onChange={(e) => setEditNoteContent(e.target.value)}
                      rows={2}
                      className="bg-[#1A1A1A] border-[#27272A] text-white focus:border-[#D4FF00] resize-none"
                    />
                    <div className="flex gap-2 justify-end">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditingNoteId(null);
                          setEditNoteContent("");
                        }}
                        className="text-[#52525B] hover:text-white h-7"
                      >
                        <X size={14} />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() =>
                          updateNote.mutate({
                            id: note.id,
                            content: editNoteContent,
                          })
                        }
                        className="bg-[#D4FF00] text-black hover:bg-[#c5f000] h-7"
                      >
                        <Save size={14} />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-[#A1A1AA] leading-relaxed">
                      {note.content}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[10px] text-[#52525B]">
                        {new Date(note.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            setEditingNoteId(note.id);
                            setEditNoteContent(note.content);
                          }}
                          className="p-1 rounded hover:bg-[#27272A] text-[#52525B] hover:text-[#A1A1AA]"
                        >
                          <Pencil size={12} />
                        </button>
                        <button
                          onClick={() => deleteNote.mutate({ id: note.id })}
                          className="p-1 rounded hover:bg-red-500/10 text-[#52525B] hover:text-red-400"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}

            {notes.length === 0 && (
              <div className="text-center py-8 text-[#52525B]">
                <StickyNote size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">No notes yet</p>
                <p className="text-xs mt-1">Add notes to keep track of conversations</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
