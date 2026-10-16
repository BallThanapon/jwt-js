const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");

const SALT_ROUNDS = 12;

function createToken(user) {
  return jwt.sign(
    { sub: user.id },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "15m",
      issuer: "express-jwt-auth",
      audience: "express-jwt-auth-client",
      algorithm: "HS256",
    }
  );
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// POST /api/auth/register
async function register(req, res, next) {
  try {
    const { username, email, password } = req.body || {};

    if (
      typeof username !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        message: "กรุณากรอก username, email และ password ให้ครบถ้วน",
      });
    }

    const normalizedUsername = username.trim().toLowerCase();
    const normalizedEmail = email.trim().toLowerCase();

    if (
      normalizedUsername.length < 3 ||
      normalizedUsername.length > 50 ||
      !/^[a-z0-9_.-]+$/.test(normalizedUsername)
    ) {
      return res.status(400).json({
        message: "username ต้องมี 3-50 ตัวอักษร และใช้ a-z, 0-9, _, . หรือ -",
      });
    }

    if (
      normalizedEmail.length > 255 ||
      !isValidEmail(normalizedEmail)
    ) {
      return res.status(400).json({
        message: "รูปแบบ email ไม่ถูกต้อง",
      });
    }

    const passwordBytes = Buffer.byteLength(password, "utf8");
    if (passwordBytes < 8 || passwordBytes > 72) {
      return res.status(400).json({
        message: "password ต้องมีความยาวระหว่าง 8-72 ไบต์",
      });
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username: normalizedUsername },
          { email: normalizedEmail },
        ],
      },
    });

    if (existingUser) {
      return res.status(409).json({
        message: "username หรือ email นี้ถูกใช้งานแล้ว",
      });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        username: normalizedUsername,
        email: normalizedEmail,
        password: hashedPassword,
      },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
      },
    });

    return res.status(201).json({
      message: "สมัครสมาชิกสำเร็จ",
      user,
    });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({
        message: "username หรือ email นี้ถูกใช้งานแล้ว",
      });
    }
    next(error);
  }
}

// POST /api/auth/login
async function login(req, res, next) {
  try {
    const { identifier, email, username, password } = req.body || {};

    const loginIdentifier =
      typeof identifier === "string"
        ? identifier
        : typeof email === "string"
          ? email
          : typeof username === "string"
            ? username
            : "";

    if (!loginIdentifier.trim() || typeof password !== "string" || !password) {
      return res.status(400).json({
        message: "กรุณากรอก username/email และ password",
      });
    }

    const value = loginIdentifier.trim().toLowerCase();

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: value }, { username: value }],
      },
    });

    if (!user) {
      return res.status(401).json({
        message: "ข้อมูลเข้าสู่ระบบไม่ถูกต้อง",
      });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      return res.status(401).json({
        message: "ข้อมูลเข้าสู่ระบบไม่ถูกต้อง",
      });
    }

    const token = createToken(user);

    return res.status(200).json({
      message: "เข้าสู่ระบบสำเร็จ",
      token,
      tokenType: "Bearer",
      expiresIn: process.env.JWT_EXPIRES_IN || "15m",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { register, login };
