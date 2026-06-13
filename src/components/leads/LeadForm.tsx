import { useState, useEffect } from "react";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Lead } from "@db/schema";

interface LeadFormProps {
  lead: Lead | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function LeadForm({ lead, onSuccess, onCancel }: LeadFormProps) {
  const isEditing = !!lead;

  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    value: "",
    notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (lead) {
      setFormData({
        name: lead.name,
        company: lead.company,
        email: lead.email,
        phone: lead.phone || "",
        value: Number(lead.value).toString(),
        notes: lead.notes || "",
      });
    }
  }, [lead]);

  const createMutation = trpc.lead.create.useMutation({ onSuccess });
  const updateMutation = trpc.lead.update.useMutation({ onSuccess });
  const isPending = createMutation.isPending || updateMutation.isPending;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.company.trim()) newErrors.company = "Company is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Invalid email format";
    if (formData.value && isNaN(Number(formData.value)))
      newErrors.value = "Value must be a number";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const data = {
      name: formData.name.trim(),
      company: formData.company.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim() || undefined,
      value: Number(formData.value) || 0,
      notes: formData.notes.trim() || undefined,
    };

    if (lead) {
      updateMutation.mutate({ id: lead.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 mt-4">
      {isEditing && (
        <p className="text-xs text-[#52525B] bg-[#0A0A0A] border border-[#27272A] rounded-lg px-3 py-2">
          Status is managed from the lead detail page or the leads table — not here.
        </p>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm text-[#A1A1AA]">
            Name <span className="text-red-400">*</span>
          </Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            placeholder="John Doe"
            className={`bg-[#121212] border-[#27272A] text-white placeholder-[#3F3F46] focus:border-[#D4FF00] focus:ring-[#D4FF00]/20 ${
              errors.name ? "border-red-500" : ""
            }`}
          />
          {errors.name && <p className="text-xs text-red-400">{errors.name}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="company" className="text-sm text-[#A1A1AA]">
            Company <span className="text-red-400">*</span>
          </Label>
          <Input
            id="company"
            value={formData.company}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, company: e.target.value }))
            }
            placeholder="Acme Corp"
            className={`bg-[#121212] border-[#27272A] text-white placeholder-[#3F3F46] focus:border-[#D4FF00] focus:ring-[#D4FF00]/20 ${
              errors.company ? "border-red-500" : ""
            }`}
          />
          {errors.company && <p className="text-xs text-red-400">{errors.company}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm text-[#A1A1AA]">
            Email <span className="text-red-400">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, email: e.target.value }))
            }
            placeholder="john@example.com"
            className={`bg-[#121212] border-[#27272A] text-white placeholder-[#3F3F46] focus:border-[#D4FF00] focus:ring-[#D4FF00]/20 ${
              errors.email ? "border-red-500" : ""
            }`}
          />
          {errors.email && <p className="text-xs text-red-400">{errors.email}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm text-[#A1A1AA]">
            Phone
          </Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, phone: e.target.value }))
            }
            placeholder="+1 (555) 123-4567"
            className="bg-[#121212] border-[#27272A] text-white placeholder-[#3F3F46] focus:border-[#D4FF00] focus:ring-[#D4FF00]/20"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="value" className="text-sm text-[#A1A1AA]">
          Deal Value ($)
        </Label>
        <Input
          id="value"
          type="number"
          value={formData.value}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, value: e.target.value }))
          }
          placeholder="50000"
          className={`bg-[#121212] border-[#27272A] text-white placeholder-[#3F3F46] focus:border-[#D4FF00] focus:ring-[#D4FF00]/20 max-w-xs ${
            errors.value ? "border-red-500" : ""
          }`}
        />
        {errors.value && <p className="text-xs text-red-400">{errors.value}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes" className="text-sm text-[#A1A1AA]">
          Notes
        </Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, notes: e.target.value }))
          }
          placeholder="Additional notes about this lead..."
          rows={3}
          className="bg-[#121212] border-[#27272A] text-white placeholder-[#3F3F46] focus:border-[#D4FF00] focus:ring-[#D4FF00]/20 resize-none"
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          className="text-[#A1A1AA] hover:text-white hover:bg-[#27272A]"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isPending}
          className="bg-[#D4FF00] text-black hover:bg-[#c5f000] hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(212,255,0,0.3)] rounded-full px-6 transition-all"
        >
          {isPending ? "Saving..." : lead ? "Update Lead" : "Create Lead"}
        </Button>
      </div>
    </form>
  );
}
