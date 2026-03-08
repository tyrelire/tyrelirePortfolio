import { Router, type Request, type Response } from "express";
import prisma from "../../prisma/client";

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
  try {
    const items = await prisma.skill.findMany({
      orderBy: { order: "asc" },
    });

    res.json(items);
  } catch {
    res.status(500).json({ error: "Failed to fetch skills" });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params["id"]);
    if (Number.isNaN(id)) {
      res.status(400).json({ error: "Invalid skill id" });
      return;
    }

    const item = await prisma.skill.findUnique({ where: { id } });
    if (!item) {
      res.status(404).json({ error: "Skill not found" });
      return;
    }

    res.json(item);
  } catch {
    res.status(500).json({ error: "Failed to fetch skill" });
  }
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const body = req.body as {
      title?: string;
      description?: string;
      iconName?: string | null;
      order?: number;
    };

    if (!body.title || !body.description) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const created = await prisma.skill.create({
      data: {
        title: body.title,
        description: body.description,
        iconName: body.iconName ?? null,
        order: body.order ?? 0,
      },
    });

    res.status(201).json(created);
  } catch {
    res.status(500).json({ error: "Failed to create skill" });
  }
});

router.put("/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params["id"]);
    if (Number.isNaN(id)) {
      res.status(400).json({ error: "Invalid skill id" });
      return;
    }

    const body = req.body as {
      title?: string;
      description?: string;
      iconName?: string | null;
      order?: number;
    };

    const existing = await prisma.skill.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: "Skill not found" });
      return;
    }

    const data = {
      ...(body.title !== undefined ? { title: body.title } : {}),
      ...(body.description !== undefined
        ? { description: body.description }
        : {}),
      ...(body.iconName !== undefined ? { iconName: body.iconName } : {}),
      ...(body.order !== undefined ? { order: body.order } : {}),
    };

    const updated = await prisma.skill.update({
      where: { id },
      data,
    });

    res.json(updated);
  } catch {
    res.status(500).json({ error: "Failed to update skill" });
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params["id"]);
    if (Number.isNaN(id)) {
      res.status(400).json({ error: "Invalid skill id" });
      return;
    }

    const existing = await prisma.skill.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: "Skill not found" });
      return;
    }

    await prisma.skill.delete({ where: { id } });
    res.status(204).send();
  } catch {
    res.status(500).json({ error: "Failed to delete skill" });
  }
});

export default router;
