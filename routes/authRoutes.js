// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// สมัครสมาชิก
router.post("/register", authController.register);

// ล็อกอิน
router.post("/login", authController.login);

// ล็อกเอาท์
router.get("/logout", authController.logout);

module.exports = router;
