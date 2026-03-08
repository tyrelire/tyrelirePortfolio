import { Router, type Request, type Response } from "express";
import {
  authenticateAdmin,
  clearAuthCookie,
  requireAdminAuth,
  setAuthCookie,
  signSessionToken,
  type AuthenticatedRequest,
  updateAdminPassword,
} from "../auth/adminAuth";

const router = Router();

const loginAttemptsByIp = new Map<string, number[]>();
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_MAX_ATTEMPTS = 10;

const normalizeInput = (value: unknown): string => {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
};

const getClientIp = (req: Request): string => {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0]?.trim() ?? "unknown";
  }

  return req.ip || "unknown";
};

const canAttemptLogin = (ip: string): boolean => {
  const now = Date.now();
  const existing = loginAttemptsByIp.get(ip) ?? [];
  const fresh = existing.filter((ts) => now - ts < LOGIN_WINDOW_MS);

  if (fresh.length >= LOGIN_MAX_ATTEMPTS) {
    loginAttemptsByIp.set(ip, fresh);
    return false;
  }

  fresh.push(now);
  loginAttemptsByIp.set(ip, fresh);
  return true;
};

router.post("/login", async (req: Request, res: Response) => {
  try {
    const pseudo = normalizeInput(req.body?.pseudo);
    const password = normalizeInput(req.body?.password);

    if (!canAttemptLogin(getClientIp(req))) {
      res.status(429).json({ error: "Too many login attempts, try later" });
      return;
    }

    if (!pseudo || !password || pseudo.length > 40 || password.length > 200) {
      res.status(400).json({ error: "Invalid credentials" });
      return;
    }

    const admin = await authenticateAdmin(pseudo, password);
    if (!admin) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const token = signSessionToken(admin.id, admin.pseudo, admin.role);
    setAuthCookie(res, token);

    res.json({
      authenticated: true,
      pseudo: admin.pseudo,
      role: admin.role,
    });
  } catch {
    res.status(500).json({ error: "Failed to login" });
  }
});

router.post("/logout", (_req: Request, res: Response) => {
  clearAuthCookie(res);
  res.status(204).send();
});

router.get("/me", requireAdminAuth, (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;

  res.json({
    authenticated: true,
    pseudo: authReq.auth.pseudo,
    role: authReq.auth.role,
  });
});

router.put(
  "/password",
  requireAdminAuth,
  async (req: Request, res: Response) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const currentPassword = normalizeInput(req.body?.currentPassword);
      const newPassword = normalizeInput(req.body?.newPassword);

      if (!currentPassword || !newPassword) {
        res.status(400).json({ error: "Missing password fields" });
        return;
      }

      if (newPassword.length < 12 || newPassword.length > 200) {
        res.status(400).json({
          error: "New password must be between 12 and 200 characters",
        });
        return;
      }

      if (newPassword === currentPassword) {
        res.status(400).json({ error: "New password must be different" });
        return;
      }

      const updated = await updateAdminPassword(
        authReq.auth.adminId,
        currentPassword,
        newPassword,
      );

      if (!updated) {
        res.status(401).json({ error: "Current password is invalid" });
        return;
      }

      res.json({ success: true });
    } catch {
      res.status(500).json({ error: "Failed to update password" });
    }
  },
);

export default router;
