// routes/transactionRoutes.js
const express = require("express");
const router = express.Router();
const transactionController = require("../controllers/transactionController");
const { isAuthenticated } = require("../middlewares/authMiddleware");

// ทุกคำขอที่นี่ต้องผ่าน session check ก่อน
router.use(isAuthenticated);

// POST /api/transactions
router.post("/", transactionController.addTransaction);

// GET  /api/transactions/:goalId
router.get("/:goalId", transactionController.getTransactions);

module.exports = router;
