const express = require('express');
const router = express.Router();
const goalController = require('../controllers/goalController');

// 🔹 สร้าง Goal (Web session)
router.post('/', goalController.createGoal);

// 🔹 ดึง Goals ทั้งหมด (Web session)
router.get('/', goalController.getGoals);

// 🔹 คำนวณความคืบหน้าของ Goal
router.get('/progress/:id', goalController.getGoalProgress);

// 🔹 ดึง Goals สำหรับ Flutter โดยใช้ userId
router.get('/:userId', goalController.getGoalsByUserId);

// 🔹 อัปเดต Goal ตาม id
router.put('/:id', goalController.updateGoal);

// 🔹 ลบ Goal ตาม id
router.delete('/:id', goalController.deleteGoal);

// 🔹 สร้าง Goal สำหรับ Flutter โดยใช้ userId
router.post('/:userId', goalController.createGoalByUserId);

module.exports = router;
