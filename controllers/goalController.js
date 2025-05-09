const mongoose = require("mongoose");
const Goal = require("../models/Goal");

// 🔹 สร้าง Goal (ใช้ session สำหรับ web)
exports.createGoal = async (req, res) => {
  const { title, targetAmount, dueDate, duration, durationType } = req.body;
  const userId = req.session.userId; // ดึง userId จาก session ที่ผู้ใช้ล็อกอินไว้

  // ถ้ายังไม่ล็อกอิน
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // ตรวจสอบว่า duration และ durationType มีการระบุหรือไม่
  if (!duration || !durationType) {
    return res.status(400).json({ message: "กรุณาระบุ duration และ durationType" });
  }

  try {
    // สร้าง goal ใหม่
    const newGoal = new Goal({
      title,
      targetAmount,
      currentAmount: 0,
      dueDate,
      user: userId, // ผูก goal นี้กับ user ที่ล็อกอิน
      duration,
      durationType,
    });

    await newGoal.save(); // บันทึกลงฐานข้อมูล
    res.status(201).json(newGoal); // ตอบกลับ goal ที่ถูกสร้าง
  } catch (err) {
    console.error("createGoal error:", err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการสร้าง Goal", error: err.message });
  }
};

// 🔹 ดึง Goals ของผู้ใช้ที่ล็อกอินอยู่ (web ใช้ session)
exports.getGoals = async (req, res) => {
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const goals = await Goal.find({ user: userId }); // ดึง goal ของ user นี้
    res.status(200).json(goals);
  } catch (err) {
    console.error("getGoals error:", err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึง Goal", error: err.message });
  }
};

// 🔹 ดึง Goals โดย userId (เหมาะสำหรับ Flutter ที่ไม่ใช้ session)
exports.getGoalsByUserId = async (req, res) => {
  const userId = req.params.userId;

  // ตรวจสอบว่า userId เป็น ObjectId ที่ถูกต้องหรือไม่
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "userId ไม่ถูกต้อง" });
  }

  try {
    const goals = await Goal.find({ user: userId });
    res.status(200).json(goals);
  } catch (err) {
    console.error("getGoalsByUserId error:", err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึง Goal", error: err.message });
  }
};

// 🔹 คำนวณความคืบหน้าและเวลาที่เหลือของเป้าหมาย
exports.getGoalProgress = async (req, res) => {
  const goalId = req.params.id;

  // ตรวจสอบว่า goalId ถูกต้องหรือไม่
  if (!mongoose.Types.ObjectId.isValid(goalId)) {
    return res.status(400).json({ message: "Goal ID ไม่ถูกต้อง" });
  }

  try {
    const goal = await Goal.findById(goalId);
    if (!goal) {
      return res.status(404).json({ message: "ไม่พบเป้าหมายนี้" });
    }

    if (goal.targetAmount === 0) {
      return res.status(400).json({ message: "Target Amount cannot be 0" });
    }

    // คำนวณเปอร์เซ็นต์ความคืบหน้า
    const progress = (goal.currentAmount / goal.targetAmount) * 100;

    const now = new Date();
    let remainingTime = 0;

    // คำนวณเวลาที่เหลือตามประเภท duration
    if (goal.durationType === "days") {
      remainingTime = Math.ceil((new Date(goal.dueDate) - now) / (1000 * 3600 * 24));
    } else if (goal.durationType === "months") {
      remainingTime = Math.ceil((new Date(goal.dueDate) - now) / (1000 * 3600 * 24 * 30));
    }

    res.status(200).json({
      goal,
      progress: progress.toFixed(2), // ให้แสดงเป็นทศนิยม 2 ตำแหน่ง
      remainingTime,
    });
  } catch (err) {
    console.error("getGoalProgress error:", err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการคำนวณความคืบหน้า", error: err.message });
  }
};

// 🔹 อัปเดต Goal
exports.updateGoal = async (req, res) => {
  const goalId = req.params.id;
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (!mongoose.Types.ObjectId.isValid(goalId)) {
    return res.status(400).json({ message: "Goal ID ไม่ถูกต้อง" });
  }

  try {
    const goal = await Goal.findById(goalId);
    if (!goal) {
      return res.status(404).json({ message: "ไม่พบเป้าหมายนี้" });
    }

    // ห้ามผู้ใช้คนอื่นอัปเดต goal ที่ไม่ใช่ของตัวเอง
    if (goal.user.toString() !== userId) {
      return res.status(403).json({ message: "คุณไม่สามารถแก้ไขเป้าหมายของผู้อื่นได้" });
    }

    // อัปเดตเฉพาะ field ที่ถูกส่งมา
    ['title','targetAmount','currentAmount','dueDate','duration','durationType'].forEach(field => {
      if (req.body[field] != null) goal[field] = req.body[field];
    });

    await goal.save(); // บันทึกการเปลี่ยนแปลง
    res.status(200).json(goal);
  } catch (err) {
    console.error("updateGoal error:", err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการอัปเดต Goal", error: err.message });
  }
};

// 🔹 ลบ Goal
exports.deleteGoal = async (req, res) => {
  const goalId = req.params.id;
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (!mongoose.Types.ObjectId.isValid(goalId)) {
    return res.status(400).json({ message: "Goal ID ไม่ถูกต้อง" });
  }

  try {
    const goal = await Goal.findById(goalId);
    if (!goal) {
      return res.status(404).json({ message: "ไม่พบเป้าหมายนี้" });
    }

    // ตรวจสอบว่า goal นี้เป็นของ user คนที่กำลังใช้งานหรือไม่
    if (goal.user.toString() !== userId) {
      return res.status(403).json({ message: "คุณไม่สามารถลบเป้าหมายของผู้อื่นได้" });
    }

    await Goal.findByIdAndDelete(goalId); // ลบ goal
    res.status(200).json({ message: "ลบ Goal สำเร็จ" });
  } catch (err) {
    console.error("deleteGoal error:", err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการลบ Goal", error: err.message });
  }
};

// 🔹 สร้าง Goal โดยใช้ userId จากพารามิเตอร์ (สำหรับ Flutter ที่ไม่ใช้ session)
exports.createGoalByUserId = async (req, res) => {
  const { title, targetAmount, dueDate, duration, durationType } = req.body;
  const userId = req.params.userId;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "userId ไม่ถูกต้อง" });
  }

  if (!duration || !durationType) {
    return res.status(400).json({ message: "กรุณาระบุ duration และ durationType" });
  }

  try {
    const newGoal = new Goal({
      title,
      targetAmount,
      currentAmount: 0,
      dueDate,
      user: userId, // กำหนด user โดยตรงจาก param
      duration,
      durationType,
    });

    await newGoal.save();
    res.status(201).json(newGoal);
  } catch (err) {
    console.error("createGoalByUserId error:", err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการสร้าง Goal", error: err.message });
  }
};
