// 📦 โหลดโมดูลที่จำเป็น
const express       = require("express");
const mongoose      = require("mongoose");
const session       = require("express-session");
const dotenv        = require("dotenv");
const cors          = require("cors");
const cookieParser  = require("cookie-parser");

// 🔐 โหลด environment variables จาก .env
dotenv.config();

// 🚀 สร้างแอป Express
const app = express();

// 🍪 ใช้ middleware สำหรับอ่าน cookie
app.use(cookieParser());

// 🌐 อนุญาต CORS เพื่อเชื่อมต่อกับ frontend (เช่น Flutter, React ฯลฯ)
app.use(cors({
  origin: true,          // อนุญาตทุก origin (หรือกำหนดเฉพาะ origin ได้)
  credentials: true      // อนุญาตส่ง cookie มาด้วย
}));

// 📦 แปลง body ที่เป็น JSON ให้ใช้ได้ใน req.body
app.use(express.json());

// 🔐 ตั้งค่า session สำหรับการ login ของ web
app.use(session({
  secret: process.env.SESSION_SECRET || "finance_secret", // ใช้ secret จาก .env หรือค่า default
  resave: false,            // ไม่บันทึก session ถ้าไม่มีการเปลี่ยนแปลง
  saveUninitialized: false, // ไม่สร้าง session ถ้าไม่ได้ login
  cookie: {
    httpOnly: true,         // ไม่ให้ JavaScript ฝั่ง client เข้าถึง cookie นี้
    secure: false,          // เปิดใช้งาน secure cookie (ควรใช้ true ถ้าใช้ HTTPS)
    sameSite: "lax",        // ป้องกัน CSRF เบื้องต้น
  },
}));

// 🛣️ กำหนดเส้นทางสำหรับ auth (เช่น login / register)
app.use("/api", require("./routes/authRoutes"));

// 🎯 เส้นทางของ goal เช่น create, update, delete goal
app.use("/api/goals", require("./routes/goalRoutes"));

// 💸 เส้นทางสำหรับ transaction เช่น ฝากเงิน ถอนเงิน
app.use("/api/transactions", require("./routes/transactionRoutes"));

// 🛢️ เชื่อมต่อ MongoDB และเริ่มต้น server
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    app.listen(process.env.PORT || 5000, () =>
      console.log("🚀 Server on port 5000")
    );
  })
  .catch(err => console.error("❌ MongoDB Error:", err));
