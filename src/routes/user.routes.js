const express = require("express");
const prisma = require("../config/prisma");
const verifyToken = require("../middleware/auth.middleware");

const router = express.Router();

// GET /api/users/me
router.get("/me", verifyToken, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(401).json({ message: "ไม่พบบัญชีผู้ใช้" });
    }

    return res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
});

// Demo protected endpoint. Restrict to admins in production.
router.get("/", verifyToken, async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({ users });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
