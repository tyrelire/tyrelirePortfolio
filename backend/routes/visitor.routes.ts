import { createHash } from "node:crypto";
import { Router, type Request, type Response } from "express";
import { requireAdminAuth } from "../auth/adminAuth";
import prisma from "../prisma/client";

const router = Router();
const OWNER_PSEUDO = process.env["ADMIN_PSEUDO"]?.trim() ?? null;

type VisitorTrackBody = {
  sessionId?: string;
  actorRole?: "ANON" | "ADMIN";
  path?: string;
  title?: string;
  referrer?: string;
  screenWidth?: number;
  screenHeight?: number;
  viewportWidth?: number;
  viewportHeight?: number;
  colorDepth?: number;
  pixelRatio?: number;
  touchPoints?: number;
  language?: string;
  languages?: string[];
  timezone?: string;
  timezoneOffset?: number;
  doNotTrack?: boolean;
  cookiesEnabled?: boolean;
  javaEnabled?: boolean;
  darkMode?: boolean;
  reducedMotion?: boolean;
  connectionType?: string;
  connectionSpeed?: string;
  downlink?: number;
  rtt?: number;
  events?: Array<{
    type: string;
    target?: string;
    path?: string;
    value?: string;
  }>;
};

const normalizeIp = (value: string): string => {
  if (!value || value === "::1") {
    return "127.0.0.1";
  }

  if (value.startsWith("::ffff:")) {
    return value.slice(7);
  }

  return value;
};

const getClientIp = (req: Request): string => {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    const first = forwarded.split(",")[0]?.trim() ?? "unknown";
    return normalizeIp(first);
  }

  return normalizeIp(req.ip || "unknown");
};

const detectBrowserFromRequest = (
  req: Request,
): { browser: string | null; browserVersion: string | null } => {
  const userAgent = req.header("user-agent") ?? "";

  const edgeMatch = /Edg\/(\d+)/i.exec(userAgent);
  if (edgeMatch?.[1]) {
    return { browser: "Edge", browserVersion: edgeMatch[1] };
  }

  const operaMatch = /OPR\/(\d+)/i.exec(userAgent);
  if (operaMatch?.[1]) {
    return { browser: "Opera", browserVersion: operaMatch[1] };
  }

  const firefoxMatch = /Firefox\/(\d+)/i.exec(userAgent);
  if (firefoxMatch?.[1]) {
    return { browser: "Firefox", browserVersion: firefoxMatch[1] };
  }

  const chromeMatch = /Chrome\/(\d+)/i.exec(userAgent);
  if (chromeMatch?.[1]) {
    return { browser: "Chrome", browserVersion: chromeMatch[1] };
  }

  const safariMatch = /Version\/(\d+).+Safari\//i.exec(userAgent);
  if (safariMatch?.[1]) {
    return { browser: "Safari", browserVersion: safariMatch[1] };
  }

  return { browser: null, browserVersion: null };
};

const detectOsFromRequest = (
  req: Request,
): { os: string | null; osVersion: string | null } => {
  const ua = req.header("user-agent") ?? "";

  if (/Windows NT 10/i.test(ua)) {
    return { os: "Windows", osVersion: "10" };
  }

  if (/Android\s([\d.]+)/i.test(ua)) {
    const match = /Android\s([\d.]+)/i.exec(ua);
    return { os: "Android", osVersion: match?.[1] ?? null };
  }

  if (/iPhone OS ([\d_]+)/i.test(ua)) {
    const match = /iPhone OS ([\d_]+)/i.exec(ua);
    return { os: "iOS", osVersion: match?.[1]?.replace(/_/g, ".") ?? null };
  }

  if (/Mac OS X ([\d_]+)/i.test(ua)) {
    const match = /Mac OS X ([\d_]+)/i.exec(ua);
    return { os: "macOS", osVersion: match?.[1]?.replace(/_/g, ".") ?? null };
  }

  if (/Linux/i.test(ua)) {
    return { os: "Linux", osVersion: null };
  }

  return { os: null, osVersion: null };
};

const detectDeviceFromRequest = (req: Request): string => {
  const ua = req.header("user-agent") ?? "";

  if (/tablet|ipad/i.test(ua)) {
    return "tablet";
  }

  if (/mobi|iphone|android/i.test(ua)) {
    return "mobile";
  }

  return "desktop";
};

const isBotFromRequest = (req: Request): boolean => {
  const ua = req.header("user-agent") ?? "";
  return /(bot|crawler|spider|curl|wget|postman)/i.test(ua);
};

const getReferrerDomain = (referrer: string | undefined): string | null => {
  if (!referrer) {
    return null;
  }

  try {
    return new URL(referrer).hostname;
  } catch {
    return null;
  }
};

const getAnonymousIdentityKey = (
  req: Request,
  body: VisitorTrackBody,
): string => {
  const ip = getClientIp(req);

  if (ip !== "unknown") {
    return `ip:${ip}`;
  }

  if (body.sessionId && body.sessionId.trim().length > 0) {
    return `sid:${body.sessionId.trim()}`;
  }

  const raw = `${req.header("user-agent") ?? "unknown"}|${req.header("accept-language") ?? "unknown"}`;
  const hash = createHash("sha256").update(raw).digest("hex").slice(0, 24);
  return `fp:${hash}`;
};

const toAdminIdentityKey = (anonymousIdentityKey: string): string =>
  `admin:${anonymousIdentityKey}`;

const getIdentityKey = (
  req: Request,
  body: VisitorTrackBody,
): {
  identityKey: string;
  anonymousIdentityKey: string;
  isAdminRole: boolean;
} => {
  const anonymousIdentityKey = getAnonymousIdentityKey(req, body);
  const isAdminRole = body.actorRole === "ADMIN";

  if (isAdminRole) {
    return {
      identityKey: toAdminIdentityKey(anonymousIdentityKey),
      anonymousIdentityKey,
      isAdminRole,
    };
  }

  return {
    identityKey: anonymousIdentityKey,
    anonymousIdentityKey,
    isAdminRole,
  };
};

router.post("/track", async (req: Request, res: Response) => {
  try {
    const body = req.body as VisitorTrackBody;
    const ip = getClientIp(req);
    const identityKeys = getIdentityKey(req, body);
    const identityKey = identityKeys.identityKey;

    if (
      identityKeys.isAdminRole &&
      identityKeys.anonymousIdentityKey !== identityKey
    ) {
      // Promote anonymous visitor history to admin identity when opening admin.
      await prisma.$transaction(async (tx) => {
        const [adminVisitor, anonymousVisitor] = await Promise.all([
          tx.visitor.findUnique({
            where: { sessionId: identityKey },
            select: { id: true },
          }),
          tx.visitor.findUnique({
            where: { sessionId: identityKeys.anonymousIdentityKey },
            select: { id: true },
          }),
        ]);

        if (!anonymousVisitor) {
          return;
        }

        if (adminVisitor) {
          await tx.pageView.updateMany({
            where: { visitorId: anonymousVisitor.id },
            data: { visitorId: adminVisitor.id },
          });
          await tx.visitorEvent.updateMany({
            where: { visitorId: anonymousVisitor.id },
            data: { visitorId: adminVisitor.id },
          });
          await tx.visitor.delete({ where: { id: anonymousVisitor.id } });
          return;
        }

        await tx.visitor.update({
          where: { id: anonymousVisitor.id },
          data: { sessionId: identityKey },
        });
      });
    }

    const browserData = detectBrowserFromRequest(req);
    const osData = detectOsFromRequest(req);
    const device = detectDeviceFromRequest(req);
    const isBot = isBotFromRequest(req);
    const userAgent = req.header("user-agent") ?? null;
    const acceptLanguage = req.header("accept-language") ?? null;
    const referrer = body.referrer ?? undefined;
    const referrerDomain = getReferrerDomain(referrer);

    const updateData: Record<string, unknown> = {
      device,
      isBot,
      actorRole: identityKeys.isAdminRole ? "ADMIN" : "ANON",
      isAuthenticated: identityKeys.isAdminRole,
      ownerPseudo: identityKeys.isAdminRole ? OWNER_PSEUDO : null,
    };

    if (ip !== "unknown") {
      updateData["ip"] = ip;
    }

    if (userAgent) {
      updateData["userAgent"] = userAgent;
    }

    if (browserData.browser) {
      updateData["browser"] = browserData.browser;
    }

    if (browserData.browserVersion) {
      updateData["browserVersion"] = browserData.browserVersion;
    }

    if (osData.os) {
      updateData["os"] = osData.os;
    }

    if (osData.osVersion) {
      updateData["osVersion"] = osData.osVersion;
    }

    if (body.language ?? acceptLanguage) {
      updateData["language"] = body.language ?? acceptLanguage;
    }

    if (body.languages) {
      updateData["languages"] = JSON.stringify(body.languages);
    }

    if (referrer !== undefined) {
      updateData["referrer"] = referrer;
      updateData["referrerDomain"] = referrerDomain;
    }

    if (body.timezone !== undefined) {
      updateData["timezone"] = body.timezone;
    }

    if (body.timezoneOffset !== undefined) {
      updateData["timezoneOffset"] = body.timezoneOffset;
    }

    if (body.screenWidth !== undefined) {
      updateData["screenWidth"] = body.screenWidth;
    }

    if (body.screenHeight !== undefined) {
      updateData["screenHeight"] = body.screenHeight;
    }

    if (body.viewportWidth !== undefined) {
      updateData["viewportWidth"] = body.viewportWidth;
    }

    if (body.viewportHeight !== undefined) {
      updateData["viewportHeight"] = body.viewportHeight;
    }

    if (body.colorDepth !== undefined) {
      updateData["colorDepth"] = body.colorDepth;
    }

    if (body.pixelRatio !== undefined) {
      updateData["pixelRatio"] = body.pixelRatio;
    }

    if (body.touchPoints !== undefined) {
      updateData["touchPoints"] = body.touchPoints;
    }

    if (body.doNotTrack !== undefined) {
      updateData["doNotTrack"] = body.doNotTrack;
    }

    if (body.cookiesEnabled !== undefined) {
      updateData["cookiesEnabled"] = body.cookiesEnabled;
    }

    if (body.javaEnabled !== undefined) {
      updateData["javaEnabled"] = body.javaEnabled;
    }

    if (body.darkMode !== undefined) {
      updateData["darkMode"] = body.darkMode;
    }

    if (body.reducedMotion !== undefined) {
      updateData["reducedMotion"] = body.reducedMotion;
    }

    if (body.connectionType !== undefined) {
      updateData["connectionType"] = body.connectionType;
    }

    if (body.connectionSpeed !== undefined) {
      updateData["connectionSpeed"] = body.connectionSpeed;
    }

    if (body.downlink !== undefined) {
      updateData["downlink"] = body.downlink;
    }

    if (body.rtt !== undefined) {
      updateData["rtt"] = body.rtt;
    }

    const visitor = await prisma.visitor.upsert({
      where: { sessionId: identityKey },
      create: {
        sessionId: identityKey,
        actorRole: identityKeys.isAdminRole ? "ADMIN" : "ANON",
        isAuthenticated: identityKeys.isAdminRole,
        ownerPseudo: identityKeys.isAdminRole ? OWNER_PSEUDO : null,
        ip: ip === "unknown" ? null : ip,
        userAgent,
        browser: browserData.browser,
        browserVersion: browserData.browserVersion,
        os: osData.os,
        osVersion: osData.osVersion,
        device,
        isBot,
        language: body.language ?? acceptLanguage,
        languages: body.languages ? JSON.stringify(body.languages) : null,
        referrer: body.referrer ?? null,
        referrerDomain,
        timezone: body.timezone ?? null,
        timezoneOffset: body.timezoneOffset ?? null,
        screenWidth: body.screenWidth ?? null,
        screenHeight: body.screenHeight ?? null,
        viewportWidth: body.viewportWidth ?? null,
        viewportHeight: body.viewportHeight ?? null,
        colorDepth: body.colorDepth ?? null,
        pixelRatio: body.pixelRatio ?? null,
        touchPoints: body.touchPoints ?? null,
        doNotTrack: body.doNotTrack ?? null,
        cookiesEnabled: body.cookiesEnabled ?? null,
        javaEnabled: body.javaEnabled ?? null,
        darkMode: body.darkMode ?? null,
        reducedMotion: body.reducedMotion ?? null,
        connectionType: body.connectionType ?? null,
        connectionSpeed: body.connectionSpeed ?? null,
        downlink: body.downlink ?? null,
        rtt: body.rtt ?? null,
      },
      update: {
        ...updateData,
      },
    });

    if (body.path) {
      await prisma.pageView.create({
        data: {
          visitorId: visitor.id,
          path: body.path,
          title: body.title ?? null,
          referrer: body.referrer ?? null,
        },
      });
    }

    if (body.events && body.events.length > 0) {
      const events = body.events
        .filter((event) => event.type && event.type.trim().length > 0)
        .map((event) => ({
          visitorId: visitor.id,
          type: event.type.trim(),
          target: event.target ?? null,
          path: event.path ?? body.path ?? null,
          value: event.value ?? null,
        }));

      if (events.length > 0) {
        await prisma.visitorEvent.createMany({ data: events });
      }
    }

    res.status(200).json({
      success: true,
      visitorId: visitor.id,
      identityKey,
    });
  } catch (error) {
    console.error("[visitors.track]", error);
    res.status(500).json({ error: "Failed to track visitor" });
  }
});

router.get("/", requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const rawTake = Number(req.query["take"]);
    const includeAdmin = req.query["includeAdmin"] === "1";
    const take = Number.isFinite(rawTake)
      ? Math.min(Math.max(Math.trunc(rawTake), 5), 200)
      : 50;

    const visitors = await prisma.visitor.findMany({
      orderBy: { lastSeenAt: "desc" },
      take,
      ...(includeAdmin
        ? {}
        : {
            where: {
              actorRole: "ANON",
            },
          }),
      select: {
        id: true,
        sessionId: true,
        actorRole: true,
        isAuthenticated: true,
        ownerPseudo: true,
        ip: true,
        country: true,
        city: true,
        browser: true,
        browserVersion: true,
        os: true,
        osVersion: true,
        device: true,
        language: true,
        timezone: true,
        isBot: true,
        firstSeenAt: true,
        lastSeenAt: true,
        _count: {
          select: {
            pageViews: true,
            events: true,
          },
        },
      },
    });

    res.json(visitors);
  } catch {
    res.status(500).json({ error: "Failed to fetch visitors" });
  }
});

router.get(
  "/summary",
  requireAdminAuth,
  async (_req: Request, res: Response) => {
    try {
      const includeAdmin = _req.query["includeAdmin"] === "1";
      const [visitorsCount, pageViewsCount, eventsCount] = includeAdmin
        ? await Promise.all([
            prisma.visitor.count(),
            prisma.pageView.count(),
            prisma.visitorEvent.count(),
          ])
        : await Promise.all([
            prisma.visitor.count({
              where: {
                actorRole: "ANON",
              },
            }),
            prisma.pageView.count({
              where: {
                visitor: {
                  actorRole: "ANON",
                },
              },
            }),
            prisma.visitorEvent.count({
              where: {
                visitor: {
                  actorRole: "ANON",
                },
              },
            }),
          ]);

      res.json({
        visitorsCount,
        pageViewsCount,
        eventsCount,
      });
    } catch {
      res.status(500).json({ error: "Failed to fetch visitor summary" });
    }
  },
);

export default router;
