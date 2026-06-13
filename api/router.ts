import { authRouter } from "./auth-router";
import { leadRouter } from "./routers/lead-router";
import { noteRouter } from "./routers/note-router";
import { taskRouter } from "./routers/task-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  lead: leadRouter,
  note: noteRouter,
  task: taskRouter,
});

export type AppRouter = typeof appRouter;
