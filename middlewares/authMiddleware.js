// 🔐 Middleware ตรวจสอบว่าเข้าสู่ระบบหรือยัง
exports.isAuthenticated = (req, res, next) => {
  // ✅ ตรวจสอบว่ามี session และมี userId หรือไม่
  if (!req.session || !req.session.userId) {
    // ❌ ถ้ายังไม่ล็อกอิน ส่งสถานะ 401 (Unauthorized)
    return res.status(401).json({ message: "คุณต้องเข้าสู่ระบบก่อน" });
  }

  // ✅ ผ่านการตรวจสอบ ให้ไปยัง middleware หรือ route ถัดไป
  next();
};
