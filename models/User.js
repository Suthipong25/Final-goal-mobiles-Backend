// 📦 โหลดโมดูลที่จำเป็น
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs"); // ใช้เข้ารหัสรหัสผ่าน

// 👤 สร้าง schema สำหรับผู้ใช้ (User)
const userSchema = new mongoose.Schema({
  // 📝 ชื่อผู้ใช้
  username: { 
    type: String, 
    required: true 
  },
  // 📧 อีเมล (ต้องไม่ซ้ำกัน)
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  // 🔒 รหัสผ่าน (จะถูก hash ก่อนบันทึก)
  password: { 
    type: String, 
    required: true 
  },
});

// 🔐 pre-save hook: เข้ารหัสรหัสผ่านก่อนบันทึกลง DB
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // ถ้าไม่ได้เปลี่ยน password ก็ข้าม
  this.password = await bcrypt.hash(this.password, 10); // เข้ารหัสด้วย bcrypt
  next();
});

// ✅ method สำหรับตรวจสอบรหัสผ่านตอน login
userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password); // เปรียบเทียบรหัสผ่านกับ hash ที่เก็บไว้
};

// 📤 สร้างและส่งออก model ชื่อ "User"
module.exports = mongoose.model("User", userSchema);
