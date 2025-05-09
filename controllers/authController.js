// controllers/authController.js
const User = require("../models/User"); // ดึง model User มาใช้งาน

// ฟังก์ชันสำหรับสมัครสมาชิก
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body; // ดึงข้อมูลจาก body ที่ผู้ใช้ส่งมา

    // ตรวจสอบว่าอีเมลนี้ถูกใช้แล้วหรือยัง
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "อีเมลนี้ถูกใช้แล้ว" });

    // สร้าง user ใหม่ (password ควรถูก hash ใน model)
    const newUser = new User({ username, email, password });
    await newUser.save(); // บันทึกลงฐานข้อมูล

    // สร้าง session และเก็บ userId เพื่อระบุว่าใครล็อกอินอยู่
    req.session.userId = newUser._id;

    // ตอบกลับว่าสมัครสำเร็จ พร้อมข้อมูลผู้ใช้ (ยกเว้น password)
    res.status(201).json({
      message: "สมัครสำเร็จ",
      user: {
        _id: newUser._id,
        email: newUser.email,
        username: newUser.username
      }
    });

  } catch (err) {
    // จัดการ error
    res.status(500).json({ message: "เกิดข้อผิดพลาด", error: err.message });
  }
};

// ฟังก์ชันสำหรับล็อกอิน
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body; // รับข้อมูลจากผู้ใช้

    const user = await User.findOne({ email }); // ค้นหา user จากอีเมล
    if (!user)
      return res.status(400).json({ message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" });

    // ตรวจสอบรหัสผ่านว่า match หรือไม่ (ใช้ bcrypt เปรียบเทียบ)
    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res.status(400).json({ message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" });

    // สร้าง session ให้ผู้ใช้ที่ล็อกอินสำเร็จ
    req.session.userId = user._id;

    // ส่งข้อมูลผู้ใช้กลับ (ไม่รวม password)
    res.status(200).json({
      message: "ล็อกอินสำเร็จ",
      user: {
        _id: user._id,
        email: user.email,
        username: user.username
      }
    });

  } catch (err) {
    // จัดการ error
    res.status(500).json({ message: "เกิดข้อผิดพลาด", error: err.message });
  }
};

// ฟังก์ชันสำหรับล็อกเอาท์
exports.logout = (req, res) => {
  // ทำลาย session ที่เก็บไว้
  req.session.destroy(() => {
    res.clearCookie("connect.sid"); // ล้าง cookie ของ session
    res.json({ message: "ล็อกเอาท์แล้ว" }); // ตอบกลับว่าล็อกเอาท์สำเร็จ
  });
};
