const mongoose = require("mongoose");

// 💳 สร้าง Schema สำหรับธุรกรรม (Transaction)
const transactionSchema = new mongoose.Schema({
  // 💰 จำนวนเงินของธุรกรรม เช่น 1000 บาท
  amount: { 
    type: Number, 
    required: true 
  },
  // 🔄 ประเภทธุรกรรม - "ฝากเงิน" หรือ "ถอนเงิน"
  type: { 
    type: String, 
    enum: ["deposit", "withdraw"],  // จำกัดค่าที่เป็นไปได้
    required: true 
  },
  // 🗓️ วันที่ทำธุรกรรม (ค่าเริ่มต้นคือวันที่ปัจจุบัน)
  date: { 
    type: Date, 
    default: Date.now 
  },
  // 🎯 เชื่อมโยงกับเป้าหมาย (Goal) ที่เกี่ยวข้องกับธุรกรรมนี้
  goal: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Goal",
    required: true 
  },
  // 👤 เชื่อมโยงกับผู้ใช้ที่เป็นเจ้าของธุรกรรม
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User" 
  },
  // 🔸 เคยมี field durationType และ duration แต่ถูกลบออกแล้ว (ไม่ใช้งานใน schema นี้)
}, { 
  // 🕓 เพิ่ม timestamps สำหรับ createdAt และ updatedAt โดยอัตโนมัติ
  timestamps: true
});

// 🏷️ สร้างและส่งออก model "Transaction"
module.exports = mongoose.model("Transaction", transactionSchema);
