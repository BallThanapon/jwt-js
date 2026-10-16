const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "กรุณาส่ง Access Token",
    });
  }

  const token = authHeader.slice(7).trim();

  if (!token) {
    return res.status(401).json({
      message: "ไม่พบ Access Token",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
      issuer: "express-jwt-auth",
      audience: "express-jwt-auth-client",
    });

    req.user = { id: decoded.sub };
    return next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Token หมดอายุ กรุณาเข้าสู่ระบบใหม่",
      });
    }

    return res.status(401).json({
      message: "Token ไม่ถูกต้อง",
    });
  }
}

module.exports = verifyToken;
