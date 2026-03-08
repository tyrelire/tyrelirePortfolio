import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import path from "node:path";
import { ensureAdminFixture } from "./auth/adminAuth";
import aboutRouter from "./routes/about";
import authRouter from "./routes/auth.routes";
import contactRouter from "./routes/contact.routes";
import visitorRouter from "./routes/visitor.routes";

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_ORIGIN =
  process.env["FRONTEND_ORIGIN"] ?? "http://localhost:3000";

app.use(express.json({ limit: "12mb" }));
app.use(express.urlencoded({ extended: true, limit: "12mb" }));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use((req: Request, res: Response, next: NextFunction) => {
  const requestOrigin = req.header("origin");
  if (requestOrigin && requestOrigin === FRONTEND_ORIGIN) {
    res.header("Access-Control-Allow-Origin", requestOrigin);
  } else {
    res.header("Access-Control-Allow-Origin", FRONTEND_ORIGIN);
  }

  res.header("Vary", "Origin");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With",
  );

  if (req.method === "OPTIONS") {
    res.status(204).send();
    return;
  }

  next();
});

app.use("/api/about", aboutRouter);
app.use("/api/auth", authRouter);
app.use("/api/contact", contactRouter);
app.use("/api/visitors", visitorRouter);

app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Hello World!" });
});

app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Route not found" });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

const startServer = async () => {
  await ensureAdminFixture();

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

void startServer().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});

export default app;
