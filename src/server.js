require("dotenv").config();

if (
  !process.env.JWT_SECRET ||
  Buffer.byteLength(process.env.JWT_SECRET, "utf8") < 32
) {
  throw new Error("JWT_SECRET must be at least 32 bytes long");
}

const app = require("./app");
const prisma = require("./config/prisma");

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await prisma.$connect();

    const server = app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });

    let shuttingDown = false;

    async function shutdown() {
      if (shuttingDown) return;
      shuttingDown = true;

      server.close(async () => {
        await prisma.$disconnect();
        process.exit(0);
      });
    }

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  } catch (error) {
    console.error("Failed to start server:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

startServer();
