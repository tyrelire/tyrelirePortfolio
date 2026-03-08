import { Router } from "express";
import { requireAdminAuth } from "../../auth/adminAuth";
import experiencesRouter from "./experiences.routes";
import educationRouter from "./education.routes";
import skillsRouter from "./skills.routes";
import introRouter from "./intro.routes";
import profileRouter from "./profile.routes";

const router = Router();

router.use((req, res, next) => {
  if (req.method === "GET") {
    next();
    return;
  }

  requireAdminAuth(req, res, next);
});

router.use("/experiences", experiencesRouter);
router.use("/education", educationRouter);
router.use("/skills", skillsRouter);
router.use("/intro", introRouter);
router.use("/profile", profileRouter);

export default router;
