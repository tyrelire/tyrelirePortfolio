import { Router, type Request, type Response } from "express";
import prisma from "../../prisma/client";

const router = Router();

const parseAchievements = (value: string): string[] => {
  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) ? (parsed as string[]) : [];
  } catch {
    return [];
  }
};

router.get("/", async (_req: Request, res: Response) => {
  try {
    const items = await prisma.experience.findMany({
      orderBy: { order: "asc" },
    });

    res.json(
      items.map((item) => ({
        ...item,
        achievements: parseAchievements(item.achievements),
      })),
    );
  } catch {
    res.status(500).json({ error: "Failed to fetch experiences" });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params["id"]);
    if (Number.isNaN(id)) {
      res.status(400).json({ error: "Invalid experience id" });
      return;
    }

    const item = await prisma.experience.findUnique({ where: { id } });

    if (!item) {
      res.status(404).json({ error: "Experience not found" });
      return;
    }

    res.json({
      ...item,
      achievements: parseAchievements(item.achievements),
    });
  } catch {
    res.status(500).json({ error: "Failed to fetch experience" });
  }
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const body = req.body as {
      company?: string;
      role?: string;
      timeframe?: string;
      achievements?: string[];
      order?: number;
    };

    if (!body.company || !body.role || !body.timeframe) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const created = await prisma.experience.create({
      data: {
        company: body.company,
        role: body.role,
        timeframe: body.timeframe,
        achievements: JSON.stringify(body.achievements ?? []),
        order: body.order ?? 0,
      },
    });

    res.status(201).json({
      ...created,
      achievements: parseAchievements(created.achievements),
    });
  } catch {
    res.status(500).json({ error: "Failed to create experience" });
  }
});

router.put("/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params["id"]);
    if (Number.isNaN(id)) {
      res.status(400).json({ error: "Invalid experience id" });
      return;
    }

    const body = req.body as {
      company?: string;
      role?: string;
      timeframe?: string;
      achievements?: string[];
      order?: number;
    };

    const existing = await prisma.experience.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: "Experience not found" });
      return;
    }

    const data = {
      ...(body.company !== undefined ? { company: body.company } : {}),
      ...(body.role !== undefined ? { role: body.role } : {}),
      ...(body.timeframe !== undefined ? { timeframe: body.timeframe } : {}),
      ...(body.achievements !== undefined
        ? { achievements: JSON.stringify(body.achievements) }
        : {}),
      ...(body.order !== undefined ? { order: body.order } : {}),
    };

    const updated = await prisma.experience.update({
      where: { id },
      data,
    });

    res.json({
      ...updated,
      achievements: parseAchievements(updated.achievements),
    });
  } catch {
    res.status(500).json({ error: "Failed to update experience" });
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params["id"]);
    if (Number.isNaN(id)) {
      res.status(400).json({ error: "Invalid experience id" });
      return;
    }

    const existing = await prisma.experience.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: "Experience not found" });
      return;
    }

    await prisma.experience.delete({ where: { id } });
    res.status(204).send();
  } catch {
    res.status(500).json({ error: "Failed to delete experience" });
  }
});

export default router;
