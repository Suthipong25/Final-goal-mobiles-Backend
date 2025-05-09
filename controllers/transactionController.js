const Transaction = require("../models/Transaction");
const Goal = require("../models/Goal");
const mongoose = require("mongoose");
const calculateProgress = require("../utils/calculateProgress");

// 🔹 เพิ่มธุรกรรม (ฝาก/ถอนเงิน)
const addTransaction = async (req, res) => {
  try {
    console.log("📥 POST /api/transactions เรียกใช้งานแล้ว");
    console.log("➡️ req.body:", req.body);

    let { amount, goalId, transactionType, userId } = req.body;
    amount = parseFloat(amount); // แปลง amount ให้เป็นตัวเลข

    // ✅ ตรวจสอบความครบถ้วนของข้อมูล
    if (amount == null || !goalId || !transactionType || !userId) {
      return res.status(400).json({ message: "❗ กรุณาระบุ amount, goalId, transactionType และ userId" });
    }

    // ✅ ตรวจสอบว่า amount ต้องมากกว่า 0 และเป็นตัวเลข
    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({ message: "❗ จำนวนเงินต้องเป็นค่าบวก (amount > 0)" });
    }

    // ✅ ตรวจสอบ transactionType ว่าต้องเป็น deposit หรือ withdraw เท่านั้น
    if (!["deposit", "withdraw"].includes(transactionType)) {
      return res.status(400).json({ message: "❗ ประเภทธุรกรรมต้องเป็น deposit หรือ withdraw เท่านั้น" });
    }

    // ✅ ตรวจสอบว่า goalId ถูกต้องหรือไม่
    if (!mongoose.Types.ObjectId.isValid(goalId)) {
      return res.status(400).json({ message: "❗ Goal ID ไม่ถูกต้อง" });
    }

    // ✅ ดึง Goal จากฐานข้อมูล
    const goal = await Goal.findById(goalId);
    if (!goal) {
      return res.status(404).json({ message: "❗ ไม่พบ Goal ที่ระบุ" });
    }

    // ✅ เช็คยอดเงินคงเหลือ ถ้าถอนเงิน
    if (transactionType === "withdraw" && goal.currentAmount < amount) {
      return res.status(400).json({ message: "❗ ยอดเงินไม่เพียงพอสำหรับการถอน" });
    }

    // ✅ สร้างธุรกรรมใหม่
    const newTransaction = new Transaction({
      amount,
      type: transactionType,
      goal: goal._id,
      user: userId,
    });

    await newTransaction.save(); // บันทึกลงฐานข้อมูล

    // ✅ อัปเดตยอดเงินใน Goal
    if (transactionType === "deposit") {
      goal.currentAmount += amount;
    } else {
      goal.currentAmount -= amount;
    }

    await goal.save(); // บันทึก Goal ที่อัปเดตแล้ว

    // ✅ คำนวณเปอร์เซ็นต์ความคืบหน้า
    const progress = calculateProgress(goal.targetAmount, goal.currentAmount);

    // ✅ ส่งผลลัพธ์กลับ
    return res.status(201).json({
      message: "✅ ธุรกรรมสำเร็จ",
      progress: progress.toFixed(2),
    });
  } 
    catch (error) {
    console.error("❌ Error during transaction:", error);
    return res.status(500).json({ message: "เกิดข้อผิดพลาดในการทำธุรกรรม", error: error.message });
  }
};

// 🔹 ดึงธุรกรรมทั้งหมดของ Goal
const getTransactions = async (req, res) => {
  try {
    const { goalId } = req.params;

    // ✅ ตรวจสอบ goalId
    if (!mongoose.Types.ObjectId.isValid(goalId)) {
      return res.status(400).json({ message: "Goal ID ไม่ถูกต้อง" });
    }

    // ✅ ดึงธุรกรรมเรียงจากล่าสุด -> เก่าสุด
    const transactions = await Transaction
      .find({ goal: goalId })
      .sort({ date: -1 })
      .populate("user", "username"); // เติมข้อมูล user เฉพาะ username

    // ✅ ดึง Goal เพื่อใช้ตรวจสอบยอดเงินปัจจุบัน
    const goal = await Goal.findById(goalId);
    if (!goal) {
      return res.status(404).json({ message: "❗ Goal ที่ระบุไม่พบ" });
    }

    // ✅ แปลงข้อมูลให้อ่านง่าย และกรองธุรกรรมที่ไม่ควรแสดง
    const simplified = transactions.map(tx => {
      if (tx.type === "withdraw" && goal.currentAmount < tx.amount) {
        return null; // ไม่แสดงธุรกรรมถอนเงินเกินยอด
      }
      return {
        _id: tx._id.toString(),
        goal: tx.goal.toString(),
        user: tx.user?._id?.toString() || "",
        amount: tx.amount,
        type: tx.type,
        durationType: tx.durationType || "",
        duration: tx.duration || 0,
        date: tx.date,
      };
    }).filter(tx => tx !== null); // ลบ null ออก

    // ✅ ส่งข้อมูลกลับ
    return res.status(200).json({ transactions: simplified });
  } catch (error) {
    console.error("❌ Error fetching transactions:", error);
    return res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงธุรกรรม", error: error.message });
  }
};

module.exports = { addTransaction, getTransactions };
