import { Router, type Request, type Response } from "express";
import { access, mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { requireAdminAuth } from "../../auth/adminAuth";

const router = Router();

const PROFILE_FILE_PATH = path.join(
  process.cwd(),
  "data",
  "about-profile.json",
);
const AVATAR_HISTORY_FILE_PATH = path.join(
  process.cwd(),
  "data",
  "about-profile-avatars.json",
);
const AVATAR_UPLOADS_DIR = path.join(process.cwd(), "uploads", "avatars");
const DEFAULT_AVATAR = "/jester-pp.webp";
const MAX_AVATAR_HISTORY = 20;

type AboutProfile = {
  avatar: string;
  location: string;
  languages: string[];
};

type AvatarHistoryItem = {
  id: string;
  url: string;
  createdAt: string;
};

const readProfile = async (): Promise<AboutProfile> => {
  const raw = await readFile(PROFILE_FILE_PATH, "utf-8");
  return JSON.parse(raw) as AboutProfile;
};

const writeProfile = async (profile: AboutProfile): Promise<void> => {
  await writeFile(
    PROFILE_FILE_PATH,
    `${JSON.stringify(profile, null, 2)}\n`,
    "utf-8",
  );
};

const readAvatarHistory = async (): Promise<AvatarHistoryItem[]> => {
  try {
    const raw = await readFile(AVATAR_HISTORY_FILE_PATH, "utf-8");
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as AvatarHistoryItem[]) : [];
  } catch {
    return [];
  }
};

const writeAvatarHistory = async (
  items: AvatarHistoryItem[],
): Promise<void> => {
  await writeFile(
    AVATAR_HISTORY_FILE_PATH,
    `${JSON.stringify(items, null, 2)}\n`,
    "utf-8",
  );
};

const parseDataUrl = (
  imageData: string,
): { mimeType: string; data: Buffer } | null => {
  const match = imageData.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
  if (!match) {
    return null;
  }

  const mimeType = match[1];
  const payload = match[2];
  if (!mimeType || !payload) {
    return null;
  }

  return {
    mimeType,
    data: Buffer.from(payload, "base64"),
  };
};

const getFileExtension = (mimeType: string): string => {
  if (mimeType === "image/png") {
    return "png";
  }

  if (mimeType === "image/jpeg") {
    return "jpg";
  }

  if (mimeType === "image/webp") {
    return "webp";
  }

  return "png";
};

const deleteFileIfExists = async (filePath: string): Promise<void> => {
  try {
    await access(filePath);
    await unlink(filePath);
  } catch {
    // Ignore when file does not exist.
  }
};

router.get("/", async (_req: Request, res: Response) => {
  try {
    const profile = await readProfile();
    res.json(profile);
  } catch {
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

router.put("/", async (req: Request, res: Response) => {
  try {
    const body = req.body as {
      location?: string;
      languages?: string[];
    };

    const current = await readProfile();

    const next: AboutProfile = {
      avatar: current.avatar,
      location: body.location ?? current.location,
      languages: body.languages ?? current.languages,
    };

    await writeProfile(next);

    res.json(next);
  } catch {
    res.status(500).json({ error: "Failed to update profile" });
  }
});

router.get(
  "/avatars",
  requireAdminAuth,
  async (_req: Request, res: Response) => {
    try {
      const avatars = await readAvatarHistory();
      res.json(avatars);
    } catch {
      res.status(500).json({ error: "Failed to fetch avatars" });
    }
  },
);

router.post(
  "/avatars",
  requireAdminAuth,
  async (req: Request, res: Response) => {
    try {
      const body = req.body as { imageData?: string };
      if (!body.imageData) {
        res.status(400).json({ error: "Missing imageData" });
        return;
      }

      const parsed = parseDataUrl(body.imageData);
      if (!parsed) {
        res.status(400).json({ error: "Invalid image format" });
        return;
      }

      await mkdir(AVATAR_UPLOADS_DIR, { recursive: true });

      const extension = getFileExtension(parsed.mimeType);
      const fileName = `${Date.now()}-${randomUUID()}.${extension}`;
      const filePath = path.join(AVATAR_UPLOADS_DIR, fileName);
      const fileUrl = `/uploads/avatars/${fileName}`;

      await writeFile(filePath, parsed.data);

      const history = await readAvatarHistory();
      const nextItem: AvatarHistoryItem = {
        id: randomUUID(),
        url: fileUrl,
        createdAt: new Date().toISOString(),
      };

      const nextHistory = [nextItem, ...history];

      if (nextHistory.length > MAX_AVATAR_HISTORY) {
        const removed = nextHistory.splice(MAX_AVATAR_HISTORY);
        for (const item of removed) {
          if (item.url.startsWith("/uploads/avatars/")) {
            const removedPath = path.join(
              process.cwd(),
              item.url.replace(/^\//, ""),
            );
            await deleteFileIfExists(removedPath);
          }
        }
      }

      await writeAvatarHistory(nextHistory);
      res.status(201).json(nextItem);
    } catch {
      res.status(500).json({ error: "Failed to upload avatar" });
    }
  },
);

router.put(
  "/avatars/:id/select",
  requireAdminAuth,
  async (req: Request, res: Response) => {
    try {
      const id = req.params["id"];
      if (!id) {
        res.status(400).json({ error: "Invalid avatar id" });
        return;
      }

      const avatars = await readAvatarHistory();
      const selected = avatars.find((item) => item.id === id);
      if (!selected) {
        res.status(404).json({ error: "Avatar not found" });
        return;
      }

      const currentProfile = await readProfile();
      const nextProfile: AboutProfile = {
        ...currentProfile,
        avatar: selected.url,
      };

      await writeProfile(nextProfile);
      res.json(nextProfile);
    } catch {
      res.status(500).json({ error: "Failed to select avatar" });
    }
  },
);

router.delete(
  "/avatars/:id",
  requireAdminAuth,
  async (req: Request, res: Response) => {
    try {
      const id = req.params["id"];
      if (!id) {
        res.status(400).json({ error: "Invalid avatar id" });
        return;
      }

      const avatars = await readAvatarHistory();
      const target = avatars.find((item) => item.id === id);
      if (!target) {
        res.status(404).json({ error: "Avatar not found" });
        return;
      }

      const nextAvatars = avatars.filter((item) => item.id !== id);
      await writeAvatarHistory(nextAvatars);

      if (target.url.startsWith("/uploads/avatars/")) {
        const filePath = path.join(
          process.cwd(),
          target.url.replace(/^\//, ""),
        );
        await deleteFileIfExists(filePath);
      }

      const currentProfile = await readProfile();
      if (currentProfile.avatar === target.url) {
        const fallbackAvatar = nextAvatars[0]?.url ?? DEFAULT_AVATAR;
        await writeProfile({
          ...currentProfile,
          avatar: fallbackAvatar,
        });
      }

      res.json({ success: true });
    } catch {
      res.status(500).json({ error: "Failed to delete avatar" });
    }
  },
);

export default router;
