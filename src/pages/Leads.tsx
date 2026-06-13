import { useState } from "react";
import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import {
  Search,
  Plus,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { LeadForm } from "@/components/leads/LeadForm";
import { LeadStatusSelect } from "@/components/leads/LeadStatusSelect";
import type { Lead, LeadStatus } from "@db/schema";

type SortBy = "name" | "company" | "value" | "status" | "createdAt";
type SortOrder = "asc" | "desc";

export default function Leads() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<SortBy>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [deletingLead, setDeletingLead] = useState<Lead | null>(null);

  const limit = 10;

  const { data, isLoading, refetch } = trpc.lead.list.useQuery({
    search: search || undefined,
    status: statusFilter !== "ALL" ? (statusFilter as LeadStatus) : undefined,
    sortBy,
    sortOrder,
    page,
    limit,
  });

  const deleteMutation = trpc.lead.delete.useMutation({
    onSuccess: () => {
      refetch();
      setDeletingLead(null);
    },
  });

  const handleSort = (field: SortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
    setPage(1);
  };

  const SortIcon = ({ field }: { field: SortBy }) => {
    if (sortBy !== field) return <ArrowUpDown size={14} className="text-[#52525B]" />;
    return sortOrder === "asc" ? (
      <ArrowUp size={14} className="text-[#D4FF00]" />
    ) : (
      <ArrowDown size={14} className="text-[#D4FF00]" />
    );
  };

  const formatCurrency = (value: string | number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(Number(value));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Leads</h1>
          <p className="text-sm text-[#52525B] mt-1">
            Manage and track your sales leads
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingLead(null);
            setShowForm(true);
          }}
          className="bg-[#D4FF00] text-black hover:bg-[#c5f000] hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(212,255,0,0.3)] rounded-full transition-all"
        >
          <Plus size={16} className="mr-2" />
          Add Lead
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#52525B]" />
          <Input
            placeholder="Search by name, company, or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9 bg-[#121212] border-[#27272A] text-white placeholder-[#52525B] focus:border-[#D4FF00] focus:ring-[#D4FF00]/20"
          />
        </div>
        <div className="flex gap-3">
          <Select
            value={statusFilter}
            onValueChange={(v) => {
              setStatusFilter(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-40 bg-[#121212] border-[#27272A] text-white">
              <Filter size={14} className="mr-2 text-[#52525B]" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-[#1A1A1A] border-[#27272A]">
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="NEW">New</SelectItem>
              <SelectItem value="CONTACTED">Contacted</SelectItem>
              <SelectItem value="NEGOTIATION">Negotiation</SelectItem>
              <SelectItem value="WON">Won</SelectItem>
              <SelectItem value="LOST">Lost</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#27272A]">
                {(["name", "company", "value", "status", "createdAt"] as SortBy[]).map(
                  (field) => (
                    <th
                      key={field}
                      className="text-left px-4 py-3 text-xs font-medium text-[#52525B] uppercase tracking-wider cursor-pointer hover:text-[#A1A1AA] transition-colors select-none"
                      onClick={() => handleSort(field)}
                    >
                      <div className="flex items-center gap-1.5">
                        {field === "createdAt" ? "Date" : field}
                        <SortIcon field={field} />
                      </div>
                    </th>
                  )
                )}
                <th className="text-left px-4 py-3 text-xs font-medium text-[#52525B] uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-4 py-3 w-12" />
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-[#27272A]/50">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <Skeleton className="h-4 w-full bg-[#27272A]" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : !data || data.leads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Users size={32} className="text-[#3F3F46]" />
                      <p className="text-[#52525B] text-sm">No leads found</p>
                      <p className="text-[#3F3F46] text-xs">
                        {search || statusFilter !== "ALL"
                          ? "Try adjusting your filters"
                          : "Add your first lead to get started"}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                data.leads.map((lead) => (
                    <tr
                      key={lead.id}
                      className="border-b border-[#27272A]/50 hover:bg-[#121212]/50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <Link
                          to={`/leads/${lead.id}`}
                          className="text-sm font-medium text-white hover:text-[#D4FF00] transition-colors"
                        >
                          {lead.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-sm text-[#A1A1AA]">{lead.company}</td>
                      <td className="px-4 py-3 text-sm text-[#D4FF00] font-medium font-display">
                        {formatCurrency(lead.value)}
                      </td>
                      <td className="px-4 py-3">
                        <LeadStatusSelect
                          leadId={lead.id}
                          status={lead.status as LeadStatus}
                          onStatusChange={() => refetch()}
                        />
                      </td>
                      <td className="px-4 py-3 text-sm text-[#52525B]">
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-[#52525B]">{lead.email}</td>
                      <td className="px-4 py-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="p-1.5 rounded-lg hover:bg-[#27272A] transition-colors">
                              <MoreHorizontal size={16} className="text-[#52525B]" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="bg-[#1A1A1A] border-[#27272A]"
                          >
                            <DropdownMenuItem asChild>
                              <Link
                                to={`/leads/${lead.id}`}
                                className="flex items-center gap-2 text-[#A1A1AA] focus:text-white focus:bg-[#27272A] cursor-pointer"
                              >
                                <Eye size={14} />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setEditingLead(lead);
                                setShowForm(true);
                              }}
                              className="flex items-center gap-2 text-[#A1A1AA] focus:text-white focus:bg-[#27272A] cursor-pointer"
                            >
                              <Pencil size={14} />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setDeletingLead(lead)}
                              className="flex items-center gap-2 text-red-400 focus:text-red-300 focus:bg-red-400/10 cursor-pointer"
                            >
                              <Trash2 size={14} />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#27272A]">
            <p className="text-xs text-[#52525B]">
              Showing {(page - 1) * limit + 1} to{" "}
              {Math.min(page * limit, data.total)} of {data.total} leads
            </p>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="text-[#52525B] hover:text-white hover:bg-[#27272A] disabled:opacity-30"
              >
                Previous
              </Button>
              {Array.from({ length: Math.min(5, data.totalPages) }).map((_, i) => {
                const pageNum = i + 1;
                return (
                  <Button
                    key={i}
                    variant="ghost"
                    size="sm"
                    onClick={() => setPage(pageNum)}
                    className={
                      page === pageNum
                        ? "bg-[#D4FF00] text-black hover:bg-[#c5f000]"
                        : "text-[#52525B] hover:text-white hover:bg-[#27272A]"
                    }
                  >
                    {pageNum}
                  </Button>
                );
              })}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPage(Math.min(data.totalPages, page + 1))}
                disabled={page === data.totalPages}
                className="text-[#52525B] hover:text-white hover:bg-[#27272A] disabled:opacity-30"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="bg-[#1A1A1A] border-[#27272A] text-white max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              {editingLead ? "Edit Lead" : "Add New Lead"}
            </DialogTitle>
            <DialogDescription className="text-[#52525B]">
              {editingLead
                ? "Update the lead information below"
                : "Fill in the details to create a new lead"}
            </DialogDescription>
          </DialogHeader>
          <LeadForm
            lead={editingLead}
            onSuccess={() => {
              setShowForm(false);
              setEditingLead(null);
              refetch();
            }}
            onCancel={() => {
              setShowForm(false);
              setEditingLead(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingLead} onOpenChange={() => setDeletingLead(null)}>
        <DialogContent className="bg-[#1A1A1A] border-[#27272A] text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Delete Lead</DialogTitle>
            <DialogDescription className="text-[#52525B]">
              Are you sure you want to delete{" "}
              <span className="text-white font-medium">{deletingLead?.name}</span>?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 justify-end mt-4">
            <Button
              variant="ghost"
              onClick={() => setDeletingLead(null)}
              className="text-[#A1A1AA] hover:text-white hover:bg-[#27272A]"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (deletingLead) {
                  deleteMutation.mutate({ id: deletingLead.id });
                }
              }}
              disabled={deleteMutation.isPending}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
