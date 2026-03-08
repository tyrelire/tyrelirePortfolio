import { Router, type Request, type Response } from "express";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const router = Router();

const INTRO_FILE_PATH = path.join(process.cwd(), "data", "about-intro.json");

type IntroContent = {
  title: string;
  display: boolean;
  description: string;
};

const readIntro = async (): Promise<IntroContent> => {
  const raw = await readFile(INTRO_FILE_PATH, "utf-8");
  return JSON.parse(raw) as IntroContent;
};

router.get("/", async (_req: Request, res: Response) => {
  try {
    const intro = await readIntro();
    res.json(intro);
  } catch {
    res.status(500).json({ error: "Failed to fetch intro" });
  }
});

router.put("/", async (req: Request, res: Response) => {
  try {
    const body = req.body as {
      title?: string;
      display?: boolean;
      description?: string;
    };

    const current = await readIntro();

    const next: IntroContent = {
      title: body.title ?? current.title,
      display: body.display ?? current.display,
      description: body.description ?? current.description,
    };

    await writeFile(
      INTRO_FILE_PATH,
      `${JSON.stringify(next, null, 2)}\n`,
      "utf-8",
    );
    res.json(next);
  } catch {
    res.status(500).json({ error: "Failed to update intro" });
  }
});

export default router;
