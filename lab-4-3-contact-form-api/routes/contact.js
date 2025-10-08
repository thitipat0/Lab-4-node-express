const express = require('express');
const router = express.Router();
const { validateContact } = require('../middleware/validation');
const { appendToJsonFile, readJsonFile } = require('../utils/fileHelper'); 

const CONTACT_FILE = 'contacts.json';

// POST /api/contact - บันทึกข้อมูลติดต่อ
router.post('/', validateContact, async (req, res) => {
    try {
        const savedContact = await appendToJsonFile(CONTACT_FILE, req.body);
        if (!savedContact) {
            return res.status(500).json({ success: false, message: 'ไม่สามารถบันทึกข้อมูลได้' });
        }
        res.status(201).json({ success: true, data: savedContact });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' });
    }
});

// GET /api/contact - ดึงข้อมูลติดต่อทั้งหมด (pagination)
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const allContacts = await readJsonFile(CONTACT_FILE);
        const total = allContacts.length;

        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginated = allContacts.slice(startIndex, endIndex);

        res.json({
            success: true,
            page,
            limit,
            total,
            data: paginated
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
    }
});

module.exports = router;