import { Router, type Request, type Response } from "express";
import { requireAdminAuth } from "../auth/adminAuth";
import prisma from "../prisma/client";

const router = Router();

router.use((req, res, next) => {
  if (req.method === "POST") {
    next();
    return;
  }

  requireAdminAuth(req, res, next);
});

const RATE_WINDOW_MS = 15 * 60 * 1000;
const RATE_MAX_MESSAGES = 5;

const submissionsByIp = new Map<string, number[]>();

type ContactStatus = "NEW" | "READ";

type ContactDelegate = {
  findMany: typeof prisma.contactMessage.findMany;
  findUnique: typeof prisma.contactMessage.findUnique;
  create: typeof prisma.contactMessage.create;
  update: typeof prisma.contactMessage.update;
  delete: typeof prisma.contactMessage.delete;
};

const normalizeText = (value: string): string =>
  value.trim().replace(/\s+/g, " ");

const hasDangerousMarkup = (value: string): boolean => /<[^>]+>/.test(value);

const isValidEmail = (value: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(value);

type ClientHintBrand = {
  brand: string;
  version: string;
};

const parseClientHintBrands = (
  rawValue: string | undefined,
): ClientHintBrand[] => {
  if (!rawValue) {
    return [];
  }

  const pairs: ClientHintBrand[] = [];
  const regex = /"([^"]+)"\s*;\s*v="([^"]+)"/g;

  let match = regex.exec(rawValue);
  while (match) {
    const brand = match[1]?.trim();
    const version = match[2]?.trim();

    if (brand && version) {
      pairs.push({ brand, version });
    }

    match = regex.exec(rawValue);
  }

  return pairs;
};

const findBrandVersion = (
  brands: ClientHintBrand[],
  predicate: (brand: string) => boolean,
): string | null => {
  const match = brands.find((item) => predicate(item.brand.toLowerCase()));
  return match?.version ?? null;
};

const detectBrowserFromRequest = (req: Request): string => {
  const clientHints = parseClientHintBrands(
    req.header("sec-ch-ua") ?? undefined,
  );

  const braveVersion = findBrandVersion(clientHints, (brand) =>
    brand.includes("brave"),
  );
  if (braveVersion) {
    return `Brave ${braveVersion}`;
  }

  const edgeVersion = findBrandVersion(
    clientHints,
    (brand) => brand.includes("microsoft edge") || brand === "edge",
  );
  if (edgeVersion) {
    return `Edge ${edgeVersion}`;
  }

  const chromeVersion = findBrandVersion(
    clientHints,
    (brand) =>
      brand.includes("google chrome") ||
      brand === "chrome" ||
      brand === "chromium",
  );
  if (chromeVersion) {
    return `Chrome ${chromeVersion}`;
  }

  const userAgent = req.header("user-agent") ?? "";

  const edgeMatch = /Edg\/(\d+)/i.exec(userAgent);
  if (edgeMatch?.[1]) {
    return `Edge ${edgeMatch[1]}`;
  }

  const operaMatch = /OPR\/(\d+)/i.exec(userAgent);
  if (operaMatch?.[1]) {
    return `Opera ${operaMatch[1]}`;
  }

  const firefoxMatch = /Firefox\/(\d+)/i.exec(userAgent);
  if (firefoxMatch?.[1]) {
    return `Firefox ${firefoxMatch[1]}`;
  }

  const chromeMatch = /Chrome\/(\d+)/i.exec(userAgent);
  if (chromeMatch?.[1]) {
    return `Chrome ${chromeMatch[1]}`;
  }

  const safariMatch = /Version\/(\d+).+Safari\//i.exec(userAgent);
  if (safariMatch?.[1]) {
    return `Safari ${safariMatch[1]}`;
  }

  return userAgent || "unknown";
};

const getClientIp = (req: Request): string => {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0]?.trim() ?? "unknown";
  }

  return req.ip || "unknown";
};

const isRateLimited = (ip: string): boolean => {
  const now = Date.now();
  const existing = submissionsByIp.get(ip) ?? [];
  const fresh = existing.filter(
    (timestamp) => now - timestamp < RATE_WINDOW_MS,
  );

  if (fresh.length >= RATE_MAX_MESSAGES) {
    submissionsByIp.set(ip, fresh);
    return true;
  }

  fresh.push(now);
  submissionsByIp.set(ip, fresh);
  return false;
};

const getContactDelegate = (): ContactDelegate | null => {
  const runtime = prisma as unknown as {
    contactMessage?: ContactDelegate;
  };

  return runtime.contactMessage ?? null;
};

router.get("/", async (req: Request, res: Response) => {
  try {
    const contact = getContactDelegate();
    if (!contact) {
      res.status(500).json({
        error:
          "Contact model unavailable. Restart backend after prisma generate.",
      });
      return;
    }

    const items = await contact.findMany({
      orderBy: { createdAt: "desc" },
    });

    res.json(items);
  } catch {
    res.status(500).json({ error: "Failed to fetch contact messages" });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params["id"]);
    if (Number.isNaN(id)) {
      res.status(400).json({ error: "Invalid contact id" });
      return;
    }

    const contact = getContactDelegate();
    if (!contact) {
      res.status(500).json({
        error:
          "Contact model unavailable. Restart backend after prisma generate.",
      });
      return;
    }

    const item = await contact.findUnique({ where: { id } });

    if (!item) {
      res.status(404).json({ error: "Contact message not found" });
      return;
    }

    res.json(item);
  } catch {
    res.status(500).json({ error: "Failed to fetch contact message" });
  }
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const body = req.body as {
      name?: string;
      email?: string;
      subject?: string;
      message?: string;
      website?: string;
    };

    if (body.website && body.website.trim().length > 0) {
      res.status(200).json({ success: true });
      return;
    }

    const name = normalizeText(body.name ?? "");
    const email = normalizeText(body.email ?? "").toLowerCase();
    const subject = normalizeText(body.subject ?? "");
    const message = (body.message ?? "").trim();

    if (!name || !email || !subject || !message) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    if (!isValidEmail(email)) {
      res.status(400).json({ error: "Invalid email" });
      return;
    }

    if (
      name.length > 80 ||
      email.length > 120 ||
      subject.length > 140 ||
      message.length > 4000
    ) {
      res.status(400).json({ error: "One or more fields are too long" });
      return;
    }

    if (
      hasDangerousMarkup(name) ||
      hasDangerousMarkup(email) ||
      hasDangerousMarkup(subject) ||
      hasDangerousMarkup(message)
    ) {
      res.status(400).json({ error: "Invalid content" });
      return;
    }

    const ip = getClientIp(req);
    if (isRateLimited(ip)) {
      res.status(429).json({ error: "Too many messages, try again later" });
      return;
    }

    const contact = getContactDelegate();
    if (!contact) {
      res.status(500).json({
        error:
          "Contact model unavailable. Restart backend after prisma generate.",
      });
      return;
    }

    await contact.create({
      data: {
        name,
        email,
        subject,
        message,
        status: "NEW",
        ip,
        userAgent: detectBrowserFromRequest(req),
      },
    });

    res.status(201).json({ success: true });
  } catch (error) {
    console.error("[contact.post]", error);
    res.status(500).json({ error: "Failed to send message" });
  }
});

router.put("/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params["id"]);
    if (Number.isNaN(id)) {
      res.status(400).json({ error: "Invalid contact id" });
      return;
    }

    const body = req.body as {
      status?: ContactStatus;
    };

    if (
      body.status !== undefined &&
      body.status !== "NEW" &&
      body.status !== "READ"
    ) {
      res.status(400).json({ error: "Invalid status" });
      return;
    }

    const contact = getContactDelegate();
    if (!contact) {
      res.status(500).json({
        error:
          "Contact model unavailable. Restart backend after prisma generate.",
      });
      return;
    }

    const existing = await contact.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: "Contact message not found" });
      return;
    }

    const updated = await contact.update({
      where: { id },
      data: {
        ...(body.status !== undefined ? { status: body.status } : {}),
      },
    });

    res.json(updated);
  } catch {
    res.status(500).json({ error: "Failed to update contact message" });
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params["id"]);
    if (Number.isNaN(id)) {
      res.status(400).json({ error: "Invalid contact id" });
      return;
    }

    const contact = getContactDelegate();
    if (!contact) {
      res.status(500).json({
        error:
          "Contact model unavailable. Restart backend after prisma generate.",
      });
      return;
    }

    const existing = await contact.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: "Contact message not found" });
      return;
    }

    await contact.delete({ where: { id } });
    res.status(204).send();
  } catch {
    res.status(500).json({ error: "Failed to delete contact message" });
  }
});

export default router;
