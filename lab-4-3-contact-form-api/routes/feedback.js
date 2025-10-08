
const express = require('express');
const router = express.Router();
const { validateFeedback } = require('../middleware/validation');
const { appendToJsonFile, readJsonFile } = require('../utils/fileHelper'); // ปรับ path ตามจริง

const FEEDBACK_FILE = 'feedbacks.json';

// POST /api/feedback - บันทึกความคิดเห็น
router.post('/', validateFeedback, async (req, res) => {
    try {
        const savedFeedback = await appendToJsonFile(FEEDBACK_FILE, req.body);
        if (!savedFeedback) {
            return res.status(500).json({ success: false, message: 'ไม่สามารถบันทึกความคิดเห็นได้' });
        }
        res.status(201).json({ success: true, data: savedFeedback });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการบันทึกความคิดเห็น' });
    }
});

// GET /api/feedback/stats - ดึงสถิติความคิดเห็น
router.get('/stats', async (req, res) => {
    try {
        const allFeedbacks = await readJsonFile(FEEDBACK_FILE);
        const total = allFeedbacks.length;
        const averageRating = total
            ? (allFeedbacks.reduce((sum, f) => sum + f.rating, 0) / total).toFixed(2)
            : 0;

        res.json({
            success: true,
            total,
            averageRating,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการดึงสถิติ' });
    }
});

module.exports = router;