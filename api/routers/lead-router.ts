import { z } from "zod";
import { Prisma } from "@prisma/client";
import { createRouter, authedQuery } from "../middleware";
import { getDb } from "../queries/connection";

const leadStatusEnum = z.enum(["NEW", "CONTACTED", "NEGOTIATION", "WON", "LOST"]);

function serializeLead<T extends { value: Prisma.Decimal }>(lead: T) {
  return { ...lead, value: lead.value.toString() };
}

export const leadRouter = createRouter({
  list: authedQuery
    .input(
      z.object({
        search: z.string().optional(),
        status: leadStatusEnum.optional(),
        sortBy: z
          .enum(["name", "company", "value", "status", "createdAt"])
          .optional()
          .default("createdAt"),
        sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
        page: z.number().min(1).optional().default(1),
        limit: z.number().min(1).max(100).optional().default(20),
      }),
    )
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const userId = ctx.user.id;
      const { search, status, sortBy, sortOrder, page, limit } = input;
      const offset = (page - 1) * limit;

      const where: Prisma.LeadWhereInput = {
        userId,
        ...(status ? { status } : {}),
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { company: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
      };

      const orderBy: Prisma.LeadOrderByWithRelationInput = {
        [sortBy]: sortOrder,
      };

      const [items, total] = await Promise.all([
        db.lead.findMany({
          where,
          orderBy,
          skip: offset,
          take: limit,
        }),
        db.lead.count({ where }),
      ]);

      return {
        leads: items.map(serializeLead),
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    }),

  getById: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const userId = ctx.user.id;

      const lead = await db.lead.findFirst({
        where: { id: input.id, userId },
        include: {
          leadNotes: { orderBy: { createdAt: "desc" } },
          leadTasks: { orderBy: { createdAt: "desc" } },
        },
      });

      if (!lead) return null;

      const { leadNotes, leadTasks, ...rest } = lead;
      return {
        ...serializeLead(rest),
        notes: leadNotes,
        tasks: leadTasks,
      };
    }),

  create: authedQuery
    .input(
      z.object({
        name: z.string().min(1),
        company: z.string().min(1),
        email: z.string().email(),
        phone: z.string().optional(),
        status: leadStatusEnum.optional().default("NEW"),
        value: z.number().min(0).optional().default(0),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const userId = ctx.user.id;

      const lead = await db.lead.create({
        data: {
          name: input.name,
          company: input.company,
          email: input.email,
          phone: input.phone || null,
          status: input.status,
          value: input.value,
          notes: input.notes || null,
          userId,
        },
      });

      await db.activityLog.create({
        data: {
          action: "CREATED",
          entityType: "LEAD",
          entityId: lead.id,
          description: `New lead created: ${input.name} (${input.company})`,
          userId,
        },
      });

      return serializeLead(lead);
    }),

  update: authedQuery
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        company: z.string().min(1).optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        status: leadStatusEnum.optional(),
        value: z.number().min(0).optional(),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const userId = ctx.user.id;
      const { id, ...updateData } = input;

      const existing = await db.lead.findFirst({
        where: { id, userId },
      });

      if (!existing) throw new Error("Lead not found");

      const lead = await db.lead.update({
        where: { id },
        data: {
          ...(updateData.name !== undefined ? { name: updateData.name } : {}),
          ...(updateData.company !== undefined
            ? { company: updateData.company }
            : {}),
          ...(updateData.email !== undefined ? { email: updateData.email } : {}),
          ...(updateData.phone !== undefined ? { phone: updateData.phone } : {}),
          ...(updateData.status !== undefined ? { status: updateData.status } : {}),
          ...(updateData.value !== undefined ? { value: updateData.value } : {}),
          ...(updateData.notes !== undefined ? { notes: updateData.notes } : {}),
        },
      });

      await db.activityLog.create({
        data: {
          action: "UPDATED",
          entityType: "LEAD",
          entityId: id,
          description: `Lead updated: ${updateData.name || existing.name}`,
          userId,
        },
      });

      return serializeLead(lead);
    }),

  updateStatus: authedQuery
    .input(z.object({ id: z.number(), status: leadStatusEnum }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const userId = ctx.user.id;

      const existing = await db.lead.findFirst({
        where: { id: input.id, userId },
      });

      if (!existing) throw new Error("Lead not found");

      const lead = await db.lead.update({
        where: { id: input.id },
        data: { status: input.status },
      });

      const actionType = input.status === "WON" ? "DEAL_WON" : "STATUS_CHANGED";
      await db.activityLog.create({
        data: {
          action: actionType,
          entityType: "LEAD",
          entityId: input.id,
          description: `Status changed to ${input.status}: ${existing.name}`,
          userId,
        },
      });

      return serializeLead(lead);
    }),

  delete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const userId = ctx.user.id;

      const existing = await db.lead.findFirst({
        where: { id: input.id, userId },
      });

      if (!existing) throw new Error("Lead not found");

      await db.lead.delete({ where: { id: input.id } });

      await db.activityLog.create({
        data: {
          action: "DELETED",
          entityType: "LEAD",
          entityId: input.id,
          description: `Lead deleted: ${existing.name}`,
          userId,
        },
      });

      return { success: true };
    }),

  dashboardStats: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const userId = ctx.user.id;

    const allLeads = await db.lead.findMany({ where: { userId } });

    const totalLeads = allLeads.length;
    const newLeads = allLeads.filter((l) => l.status === "NEW").length;
    const contactedLeads = allLeads.filter((l) => l.status === "CONTACTED").length;
    const negotiationLeads = allLeads.filter((l) => l.status === "NEGOTIATION").length;
    const wonDeals = allLeads.filter((l) => l.status === "WON").length;
    const lostDeals = allLeads.filter((l) => l.status === "LOST").length;
    const wonRevenue = allLeads
      .filter((l) => l.status === "WON")
      .reduce((sum, l) => sum + Number(l.value), 0);
    const estimatedRevenue = allLeads
      .filter((l) => l.status !== "LOST")
      .reduce((sum, l) => sum + Number(l.value), 0);

    return {
      totalLeads,
      newLeads,
      contactedLeads,
      negotiationLeads,
      wonDeals,
      lostDeals,
      wonRevenue,
      estimatedRevenue,
    };
  }),

  recentActivity: authedQuery
    .input(z.object({ limit: z.number().min(1).max(50).optional().default(10) }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const userId = ctx.user.id;

      return db.activityLog.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: input.limit,
      });
    }),

  pipelineData: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const userId = ctx.user.id;

    const allLeads = await db.lead.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    const serialized = allLeads.map(serializeLead);

    return {
      NEW: serialized.filter((l) => l.status === "NEW"),
      CONTACTED: serialized.filter((l) => l.status === "CONTACTED"),
      NEGOTIATION: serialized.filter((l) => l.status === "NEGOTIATION"),
      WON: serialized.filter((l) => l.status === "WON"),
      LOST: serialized.filter((l) => l.status === "LOST"),
    };
  }),
});
