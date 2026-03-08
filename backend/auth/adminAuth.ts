import {
  createHmac,
  randomBytes,
  scrypt as scryptCb,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";
import type { NextFunction, Request, Response } from "express";
import prisma from "../prisma/client";

type AdminRole = "OWNER" | "ADMIN";

const scrypt = promisify(scryptCb);

const getRequiredEnv = (name: string): string => {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`[auth] Missing required environment variable: ${name}`);
  }

  return value;
};

const INITIAL_ADMIN_PSEUDO = getRequiredEnv("ADMIN_PSEUDO");
export const AUTH_COOKIE_NAME = "admin_session";

const AUTH_SECRET = getRequiredEnv("AUTH_SECRET");
const SESSION_TTL_SECONDS = 60 * 60 * 12;

type SessionPayload = {
  sub: number;
  pseudo: string;
  role: AdminRole;
  iat: number;
  exp: number;
};

const toBase64Url = (input: Buffer | string): string =>
  Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");

const fromBase64Url = (input: string): Buffer => {
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const padLength = (4 - (base64.length % 4)) % 4;
  return Buffer.from(`${base64}${"=".repeat(padLength)}`, "base64");
};

const signData = (data: string): string =>
  toBase64Url(createHmac("sha256", AUTH_SECRET).update(data).digest());

export async function hashPassword(plainPassword: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scrypt(plainPassword, salt, 64)) as Buffer;
  return `${salt}:${derived.toString("hex")}`;
}

export async function verifyPassword(
  plainPassword: string,
  hashedPassword: string,
): Promise<boolean> {
  const [salt, storedHash] = hashedPassword.split(":");
  if (!salt || !storedHash) {
    return false;
  }

  const derived = (await scrypt(plainPassword, salt, 64)) as Buffer;
  const stored = Buffer.from(storedHash, "hex");
  if (stored.length !== derived.length) {
    return false;
  }

  return timingSafeEqual(stored, derived);
}

export function signSessionToken(
  adminId: number,
  pseudo: string,
  role: AdminRole,
): string {
  const now = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = {
    sub: adminId,
    pseudo,
    role,
    iat: now,
    exp: now + SESSION_TTL_SECONDS,
  };

  const payloadEncoded = toBase64Url(JSON.stringify(payload));
  const signature = signData(payloadEncoded);
  return `${payloadEncoded}.${signature}`;
}

function verifySessionToken(token: string): SessionPayload | null {
  const [payloadPart, signaturePart] = token.split(".");
  if (!payloadPart || !signaturePart) {
    return null;
  }

  const expectedSignature = signData(payloadPart);
  const expected = Buffer.from(expectedSignature);
  const received = Buffer.from(signaturePart);

  if (expected.length !== received.length) {
    return null;
  }

  if (!timingSafeEqual(expected, received)) {
    return null;
  }

  try {
    const payload = JSON.parse(fromBase64Url(payloadPart).toString("utf-8")) as
      | SessionPayload
      | undefined;

    if (!payload) {
      return null;
    }

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp <= now) {
      return null;
    }

    if (!payload.pseudo) {
      return null;
    }

    if (payload.role !== "OWNER" && payload.role !== "ADMIN") {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

function parseCookies(req: Request): Record<string, string> {
  const header = req.headers["cookie"];
  if (!header) {
    return {};
  }

  const raw = Array.isArray(header) ? header.join(";") : header;
  return raw
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce<Record<string, string>>((acc, entry) => {
      const idx = entry.indexOf("=");
      if (idx <= 0) {
        return acc;
      }

      const key = entry.slice(0, idx).trim();
      const value = entry.slice(idx + 1).trim();
      acc[key] = value;
      return acc;
    }, {});
}

function buildCookie(token: string): string {
  const parts = [
    `${AUTH_COOKIE_NAME}=${token}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Strict",
    `Max-Age=${SESSION_TTL_SECONDS}`,
  ];

  if (process.env["NODE_ENV"] === "production") {
    parts.push("Secure");
  }

  return parts.join("; ");
}

function buildExpiredCookie(): string {
  const parts = [
    `${AUTH_COOKIE_NAME}=`,
    "Path=/",
    "HttpOnly",
    "SameSite=Strict",
    "Max-Age=0",
  ];

  if (process.env["NODE_ENV"] === "production") {
    parts.push("Secure");
  }

  return parts.join("; ");
}

export function setAuthCookie(res: Response, token: string): void {
  res.setHeader("Set-Cookie", buildCookie(token));
}

export function clearAuthCookie(res: Response): void {
  res.setHeader("Set-Cookie", buildExpiredCookie());
}

export type AuthenticatedRequest = Request & {
  auth: {
    adminId: number;
    pseudo: string;
    role: AdminRole;
  };
};

export function requireAdminAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const cookies = parseCookies(req);
  const token = cookies[AUTH_COOKIE_NAME];

  if (!token) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const payload = verifySessionToken(token);
  if (!payload) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  (req as AuthenticatedRequest).auth = {
    adminId: payload.sub,
    pseudo: payload.pseudo,
    role: payload.role,
  };

  next();
}

export async function ensureAdminFixture(options?: {
  syncPasswordFromEnv?: boolean;
}): Promise<void> {
  const initialPassword = getRequiredEnv("ADMIN_INITIAL_PASSWORD");
  const passwordHash = await hashPassword(initialPassword);

  const existing = await prisma.admin.findUnique({
    where: { pseudo: INITIAL_ADMIN_PSEUDO },
    select: { id: true },
  });

  if (existing) {
    if (options?.syncPasswordFromEnv) {
      await prisma.admin.update({
        where: { id: existing.id },
        data: { password: passwordHash },
      });

      console.log(
        `[auth] admin fixture password synced from .env for pseudo ${INITIAL_ADMIN_PSEUDO}`,
      );
    }

    return;
  }

  await prisma.admin.create({
    data: {
      pseudo: INITIAL_ADMIN_PSEUDO,
      role: "OWNER",
      password: passwordHash,
    },
  });

  console.log(
    `[auth] admin fixture created for pseudo ${INITIAL_ADMIN_PSEUDO}`,
  );
}

export async function authenticateAdmin(
  pseudo: string,
  plainPassword: string,
): Promise<{ id: number; pseudo: string; role: AdminRole } | null> {
  if (!pseudo) {
    return null;
  }

  const admin = await prisma.admin.findUnique({
    where: { pseudo },
    select: { id: true, password: true, role: true },
  });

  if (!admin) {
    return null;
  }

  const isValid = await verifyPassword(plainPassword, admin.password);
  if (!isValid) {
    return null;
  }

  return { id: admin.id, pseudo, role: admin.role };
}

export async function updateAdminPassword(
  adminId: number,
  currentPassword: string,
  nextPassword: string,
): Promise<boolean> {
  const admin = await prisma.admin.findUnique({
    where: { id: adminId },
    select: { id: true, password: true },
  });

  if (!admin) {
    return false;
  }

  const currentOk = await verifyPassword(currentPassword, admin.password);
  if (!currentOk) {
    return false;
  }

  const nextHash = await hashPassword(nextPassword);
  await prisma.admin.update({
    where: { id: admin.id },
    data: { password: nextHash },
  });

  return true;
}
