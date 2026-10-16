function errorMiddleware(err, req, res, next) {
  console.error(err);

  if (res.headersSent) {
    return next(err);
  }

  return res.status(500).json({
    message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์",
  });
}

module.exports = errorMiddleware;
