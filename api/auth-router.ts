import { z } from "zod";
import * as cookie from "cookie";
import { Session } from "@contracts/constants";
import { getSessionCookieOptions } from "./lib/cookies";
import { createRouter, authedQuery, publicQuery } from "./middleware";
import {
  createUser,
  findUserByEmail,
  toSafeUser,
  updateLastSignIn,
} from "./queries/users";
import { hashPassword, verifyPassword } from "./auth/password";
import { authError, setSessionCookie } from "./auth/helpers";

export const authRouter = createRouter({
  me: authedQuery.query((opts) => opts.ctx.user),

  signup: publicQuery
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(8, "Password must be at least 8 characters"),
        name: z.string().min(1).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await findUserByEmail(input.email);
      if (existing) {
        throw authError("An account with this email already exists.");
      }

      const passwordHash = await hashPassword(input.password);
      const user = await createUser({
        email: input.email,
        passwordHash,
        name: input.name,
      });

      await setSessionCookie(ctx, user.id);
      return toSafeUser(user);
    }),

  login: publicQuery
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await findUserByEmail(input.email);
      if (!user) {
        throw authError("Invalid email or password.");
      }

      const valid = await verifyPassword(input.password, user.passwordHash);
      if (!valid) {
        throw authError("Invalid email or password.");
      }

      await updateLastSignIn(user.id);
      await setSessionCookie(ctx, user.id);
      return toSafeUser(user);
    }),

  logout: authedQuery.mutation(async ({ ctx }) => {
    const opts = getSessionCookieOptions(ctx.req.headers);
    ctx.resHeaders.append(
      "set-cookie",
      cookie.serialize(Session.cookieName, "", {
        httpOnly: opts.httpOnly,
        path: opts.path,
        sameSite: opts.sameSite?.toLowerCase() as "lax" | "none",
        secure: opts.secure,
        maxAge: 0,
      }),
    );
    return { success: true };
  }),
});
