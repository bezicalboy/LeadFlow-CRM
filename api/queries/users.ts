import { prisma } from "./connection";
import type { SafeUser } from "@db/schema";
import type { User } from "@prisma/client";
import { env } from "../lib/env";

export function toSafeUser(user: User): SafeUser {
  const { passwordHash: _, ...safeUser } = user;
  return safeUser;
}

export async function findUserById(id: number) {
  return prisma.user.findUnique({ where: { id } });
}

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });
}

export async function createUser(data: {
  email: string;
  passwordHash: string;
  name?: string;
}) {
  const email = data.email.toLowerCase();
  const userCount = await prisma.user.count();
  const role =
    userCount === 0 || (env.ownerEmail && email === env.ownerEmail)
      ? "admin"
      : "user";

  return prisma.user.create({
    data: {
      email,
      passwordHash: data.passwordHash,
      name: data.name ?? email.split("@")[0],
      role,
      lastSignInAt: new Date(),
    },
  });
}

export async function updateLastSignIn(userId: number) {
  return prisma.user.update({
    where: { id: userId },
    data: { lastSignInAt: new Date() },
  });
}
