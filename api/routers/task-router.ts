import { z } from "zod";
import { createRouter, authedQuery } from "../middleware";
import { getDb } from "../queries/connection";

export const taskRouter = createRouter({
  list: authedQuery
    .input(
      z
        .object({
          leadId: z.number().optional(),
          completed: z.boolean().optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const userId = ctx.user.id;

      return db.leadTask.findMany({
        where: {
          userId,
          ...(input?.leadId !== undefined ? { leadId: input.leadId } : {}),
          ...(input?.completed !== undefined
            ? { completed: input.completed }
            : {}),
        },
        orderBy: { createdAt: "desc" },
      });
    }),

  create: authedQuery
    .input(
      z.object({
        leadId: z.number(),
        title: z.string().min(1),
        description: z.string().optional(),
        dueDate: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const userId = ctx.user.id;

      const lead = await db.lead.findFirst({
        where: { id: input.leadId, userId },
      });

      if (!lead) throw new Error("Lead not found");

      return db.leadTask.create({
        data: {
          title: input.title,
          description: input.description || null,
          dueDate: input.dueDate ? new Date(input.dueDate) : null,
          leadId: input.leadId,
          userId,
        },
      });
    }),

  update: authedQuery
    .input(
      z.object({
        id: z.number(),
        title: z.string().min(1).optional(),
        description: z.string().optional(),
        dueDate: z.string().nullable().optional(),
        completed: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const userId = ctx.user.id;
      const { id, ...updateData } = input;

      const existing = await db.leadTask.findFirst({
        where: { id, userId },
      });

      if (!existing) throw new Error("Task not found");

      const task = await db.leadTask.update({
        where: { id },
        data: {
          ...(updateData.title !== undefined ? { title: updateData.title } : {}),
          ...(updateData.description !== undefined
            ? { description: updateData.description }
            : {}),
          ...(updateData.dueDate !== undefined
            ? {
                dueDate: updateData.dueDate
                  ? new Date(updateData.dueDate)
                  : null,
              }
            : {}),
          ...(updateData.completed !== undefined
            ? { completed: updateData.completed }
            : {}),
        },
      });

      if (updateData.completed === true && existing.completed === false) {
        await db.activityLog.create({
          data: {
            action: "TASK_COMPLETED",
            entityType: "TASK",
            entityId: id,
            description: `Task completed: ${updateData.title || existing.title}`,
            userId,
          },
        });
      }

      return task;
    }),

  toggleComplete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const userId = ctx.user.id;

      const existing = await db.leadTask.findFirst({
        where: { id: input.id, userId },
      });

      if (!existing) throw new Error("Task not found");

      const newCompleted = !existing.completed;
      const task = await db.leadTask.update({
        where: { id: input.id },
        data: { completed: newCompleted },
      });

      if (newCompleted) {
        await db.activityLog.create({
          data: {
            action: "TASK_COMPLETED",
            entityType: "TASK",
            entityId: input.id,
            description: `Task completed: ${existing.title}`,
            userId,
          },
        });
      }

      return task;
    }),

  delete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const userId = ctx.user.id;

      const existing = await db.leadTask.findFirst({
        where: { id: input.id, userId },
      });

      if (!existing) throw new Error("Task not found");

      await db.leadTask.delete({ where: { id: input.id } });

      return { success: true };
    }),
});
