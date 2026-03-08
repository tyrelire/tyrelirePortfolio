import "dotenv/config";
import prisma from "../prisma/client";
import { ensureAdminFixture } from "../auth/adminAuth";

async function seedAdmin() {
  await ensureAdminFixture({ syncPasswordFromEnv: true });
  const pseudo = process.env["ADMIN_PSEUDO"] ?? "(undefined)";
  console.log(`[seed-admin] admin fixture ensured for pseudo ${pseudo}`);
}

void seedAdmin()
  .catch((error) => {
    console.error("[seed-admin] failed", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
