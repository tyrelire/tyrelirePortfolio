import { Router, type Request, type Response } from "express";
import prisma from "../../prisma/client";

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
  try {
    const items = await prisma.education.findMany({
      orderBy: { order: "asc" },
    });

    res.json(items);
  } catch {
    res.status(500).json({ error: "Failed to fetch education" });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params["id"]);
    if (Number.isNaN(id)) {
      res.status(400).json({ error: "Invalid education id" });
      return;
    }

    const item = await prisma.education.findUnique({ where: { id } });
    if (!item) {
      res.status(404).json({ error: "Education not found" });
      return;
    }

    res.json(item);
  } catch {
    res.status(500).json({ error: "Failed to fetch education" });
  }
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const body = req.body as {
      institution?: string;
      date?: string;
      description?: string;
      order?: number;
    };

    if (!body.institution || !body.date || !body.description) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const created = await prisma.education.create({
      data: {
        institution: body.institution,
        date: body.date,
        description: body.description,
        order: body.order ?? 0,
      },
    });

    res.status(201).json(created);
  } catch {
    res.status(500).json({ error: "Failed to create education" });
  }
});

router.put("/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params["id"]);
    if (Number.isNaN(id)) {
      res.status(400).json({ error: "Invalid education id" });
      return;
    }

    const body = req.body as {
      institution?: string;
      date?: string;
      description?: string;
      order?: number;
    };

    const existing = await prisma.education.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: "Education not found" });
      return;
    }

    const data = {
      ...(body.institution !== undefined
        ? { institution: body.institution }
        : {}),
      ...(body.date !== undefined ? { date: body.date } : {}),
      ...(body.description !== undefined
        ? { description: body.description }
        : {}),
      ...(body.order !== undefined ? { order: body.order } : {}),
    };

    const updated = await prisma.education.update({
      where: { id },
      data,
    });

    res.json(updated);
  } catch {
    res.status(500).json({ error: "Failed to update education" });
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params["id"]);
    if (Number.isNaN(id)) {
      res.status(400).json({ error: "Invalid education id" });
      return;
    }

    const existing = await prisma.education.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: "Education not found" });
      return;
    }

    await prisma.education.delete({ where: { id } });
    res.status(204).send();
  } catch {
    res.status(500).json({ error: "Failed to delete education" });
  }
});

export default router;
