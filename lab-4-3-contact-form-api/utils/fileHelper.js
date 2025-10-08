const fs = require('fs').promises;

// ฟังก์ชันสำหรับเพิ่มข้อมูลลงไฟล์ JSON
async function appendToJsonFile(filePath, newData) {
  try {
    let data = [];
    try {
      const fileContent = await fs.readFile(filePath, 'utf8');
      data = JSON.parse(fileContent);
    } catch (err) {
      if (err.code !== 'ENOENT') throw err; // ไฟล์ไม่พบ → สร้างใหม่
    }

    data.push(newData);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
    return newData;
  } catch (err) {
    console.error('Error writing JSON:', err);
    return null;
  }
}

// ฟังก์ชันสำหรับอ่านไฟล์ JSON
async function readJsonFile(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    return JSON.parse(content);
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }
}

module.exports = {
  appendToJsonFile,
  readJsonFile,
};