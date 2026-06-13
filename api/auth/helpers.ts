import * as cookie from "cookie";
import { TRPCError } from "@trpc/server";
import { Session } from "@contracts/constants";
import { getSessionCookieOptions } from "../lib/cookies";
import { signSessionToken } from "./session";
import type { TrpcContext } from "../context";
import type { SafeUser } from "@db/schema";

export async function setSessionCookie(
  ctx: TrpcContext,
  userId: number,
): Promise<void> {
  const token = await signSessionToken({ userId });
  const opts = getSessionCookieOptions(ctx.req.headers);
  ctx.resHeaders.append(
    "set-cookie",
    cookie.serialize(Session.cookieName, token, {
      httpOnly: opts.httpOnly,
      path: opts.path,
      sameSite: opts.sameSite?.toLowerCase() as "lax" | "none",
      secure: opts.secure,
      maxAge: Session.maxAgeMs / 1000,
    }),
  );
}

export function sanitizeUser(user: {
  id: number;
  email: string;
  name: string | null;
  avatar: string | null;
  role: SafeUser["role"];
  createdAt: Date;
  updatedAt: Date;
  lastSignInAt: Date;
}): SafeUser {
  return user;
}

export function authError(message: string): TRPCError {
  return new TRPCError({ code: "UNAUTHORIZED", message });
}
