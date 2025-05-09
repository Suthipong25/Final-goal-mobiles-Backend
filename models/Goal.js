const mongoose = require('mongoose');

// 🔧 สร้าง Schema สำหรับ Goal
const goalSchema = new mongoose.Schema({
  // 📌 ชื่อเป้าหมาย เช่น "เก็บเงินเที่ยวญี่ปุ่น"
  title: {
    type: String,
    required: true,
  },
  // 🎯 เป้าหมายเงินที่ต้องการ เช่น 50000 บาท
  targetAmount: {
    type: Number,
    required: true,
  },
  // 💰 จำนวนเงินที่สะสมไว้ปัจจุบัน เริ่มต้นที่ 0
  currentAmount: {
    type: Number,
    required: true,
    default: 0,
  },
  // 📅 วันที่สิ้นสุดของเป้าหมาย เช่น 2025-12-31
  dueDate: {
    type: Date,
    required: true,
  },
  // 🕒 ประเภทของระยะเวลา เช่น "days" หรือ "months"
  durationType: {
    type: String,
    required: true,
  },
  // ⏳ จำนวนระยะเวลาตามประเภท เช่น 30 (ถ้า durationType คือ days)
  duration: {
    type: Number,
    required: true,
  },
  // 👤 ผู้ใช้เจ้าของเป้าหมายนี้ (อ้างอิงถึง _id ใน collection "users")
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  // 🕓 เปิดใช้งาน timestamps เพื่อเพิ่มฟิลด์ createdAt และ updatedAt อัตโนมัติ
  timestamps: true
});

// 🏷️ สร้าง model ชื่อ 'Goal' จาก schema นี้
const Goal = mongoose.model('Goal', goalSchema);

// 📤 ส่งออก model เพื่อใช้งานใน controller หรือที่อื่น
module.exports = Goal;
