import { z } from "zod";
import { createRouter, authedQuery } from "../middleware";
import { getDb } from "../queries/connection";

export const noteRouter = createRouter({
  list: authedQuery
    .input(z.object({ leadId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const userId = ctx.user.id;

      const lead = await db.lead.findFirst({
        where: { id: input.leadId, userId },
      });

      if (!lead) return [];

      return db.leadNote.findMany({
        where: { leadId: input.leadId },
        orderBy: { createdAt: "desc" },
      });
    }),

  create: authedQuery
    .input(z.object({ leadId: z.number(), content: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const userId = ctx.user.id;

      const lead = await db.lead.findFirst({
        where: { id: input.leadId, userId },
      });

      if (!lead) throw new Error("Lead not found");

      const note = await db.leadNote.create({
        data: {
          content: input.content,
          leadId: input.leadId,
        },
      });

      await db.activityLog.create({
        data: {
          action: "NOTE_ADDED",
          entityType: "NOTE",
          entityId: note.id,
          description: `Note added to lead: ${lead.name}`,
          userId,
        },
      });

      return note;
    }),

  update: authedQuery
    .input(z.object({ id: z.number(), content: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const userId = ctx.user.id;

      const note = await db.leadNote.findUnique({
        where: { id: input.id },
      });

      if (!note) throw new Error("Note not found");

      const lead = await db.lead.findFirst({
        where: { id: note.leadId, userId },
      });

      if (!lead) throw new Error("Unauthorized");

      return db.leadNote.update({
        where: { id: input.id },
        data: { content: input.content },
      });
    }),

  delete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const userId = ctx.user.id;

      const note = await db.leadNote.findUnique({
        where: { id: input.id },
      });

      if (!note) throw new Error("Note not found");

      const lead = await db.lead.findFirst({
        where: { id: note.leadId, userId },
      });

      if (!lead) throw new Error("Unauthorized");

      await db.leadNote.delete({ where: { id: input.id } });

      return { success: true };
    }),
});
