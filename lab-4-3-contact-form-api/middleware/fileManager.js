const fs = require('fs').promises;
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');

// สร้างโฟลเดอร์ data ถ้าไม่มี
const ensureDataDir = async () => {
    try {
        await fs.access(DATA_DIR);
    } catch (error) {
        await fs.mkdir(DATA_DIR, { recursive: true });
    }
};

// อ่านข้อมูลจากไฟล์
const readJsonFile = async (filename) => {
    try {
        await ensureDataDir();
        const filePath = path.join(DATA_DIR, filename);
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        // ถ้าไฟล์ไม่มี ให้ return array ว่าง []
        return [];
    }
};

// เขียนข้อมูลลงไฟล์
const writeJsonFile = async (filename, data) => {
    try {
        await ensureDataDir();
        const filePath = path.join(DATA_DIR, filename);
        await fs.writeFile(filePath, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('Error writing file:', error);
        return false;
    }
};

// เพิ่มข้อมูลใหม่ลงไฟล์
const appendToJsonFile = async (filename, newData) => {
    try {
        const existingData = await readJsonFile(filename);

        // เพิ่ม ID และ timestamp ให้ข้อมูลใหม่
        const dataWithId = {
            id: Date.now(),
            ...newData,
            createdAt: new Date().toISOString()
        };

        existingData.push(dataWithId);
        await writeJsonFile(filename, existingData);
        return dataWithId;
    } catch (error) {
        console.error('Error appending to file:', error);
        return null;
    }
};

// สร้างฟังก์ชัน getFileStats
// ส่งกลับจำนวนข้อมูลในแต่ละไฟล์
const getFileStats = async (filename) => {
    try {
        const data = await readJsonFile(filename);
        return {
            filename,
            count: Array.isArray(data) ? data.length : 0
        };
    } catch (error) {
        console.error('Error getting file stats:', error);
        return {
            filename,
            count: 0
        };
    }
};

module.exports = {
    readJsonFile,
    writeJsonFile,
    appendToJsonFile,
    getFileStats
};