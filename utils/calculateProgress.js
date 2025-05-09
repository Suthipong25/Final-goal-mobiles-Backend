/**
 * ฟังก์ชันคำนวณความคืบหน้าของ Goal
 * @param {number} goalAmount เป้าหมายที่ต้องการ
 * @param {number} totalDeposits จำนวนเงินที่ฝากเข้าไป
 * @returns {number} ความคืบหน้าในรูปแบบเปอร์เซ็นต์
 */
const calculateProgress = (goalAmount, totalDeposits) => {
    // ตรวจสอบให้แน่ใจว่า goalAmount และ totalDeposits เป็นตัวเลขที่ถูกต้อง
    if (goalAmount <= 0) {
      return 0; // เป้าหมายไม่ถูกต้องหรือไม่มียอด
    }
  
    if (totalDeposits < 0) {
      return 0; // จำนวนเงินฝากต้องไม่เป็นลบ
    }
  
    // คำนวณความคืบหน้า
    const progress = (totalDeposits / goalAmount) * 100;
    
    // คืนค่าความคืบหน้าสูงสุดไม่เกิน 100%
    return Math.min(progress, 100);  // ความคืบหน้าต้องไม่เกิน 100%
  };
  
  module.exports = calculateProgress;
  