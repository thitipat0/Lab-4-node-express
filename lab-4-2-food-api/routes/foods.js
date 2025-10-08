const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const DATA_FILE_NAME = 'foods.json';
const dataPath = path.join(__dirname, '..', 'data', DATA_FILE_NAME);

/**
 * @function loadFoods
 * @description อ่านข้อมูลอาหารจากไฟล์ JSON
 * @returns {Array} รายการอาหาร
 */
function loadFoods() {
    if (!fs.existsSync(dataPath)) {
        console.error(`❌ Data file not found: ${dataPath}. Please check your path and file name.`);
        return [];
    }
    
    try {
        const rawData = fs.readFileSync(dataPath, 'utf8');
        return JSON.parse(rawData);
    } catch (error) {
        console.error('❌ Failed to load or parse food data. Check JSON format.', error.message);
        return []; 
    }
}

/**
 * @function saveFoods
 * @description เขียนข้อมูลอาหารกลับไปยังไฟล์ JSON
 * @param {Array} foods - รายการอาหารที่ต้องการบันทึก
 */
function saveFoods(foods) {
    try {
        fs.writeFileSync(dataPath, JSON.stringify(foods, null, 2), 'utf8');
    } catch (error) {
        console.error('❌ Failed to save food data:', error.message);
    }
}

// =======================================================
// ✅ GET Endpoints (Read Operations)
// =======================================================

// ✅ GET /api/foods + filter: ดึงข้อมูลอาหารทั้งหมดพร้อมตัวกรอง
router.get('/', (req, res) => {
    const foods = loadFoods();
    const { search, category, maxSpicy, vegetarian } = req.query;
    let result = foods;

    if (search) {
        const searchTerm = search.toLowerCase();
        result = result.filter(f => f.name.toLowerCase().includes(searchTerm)); 
    }
    if (category) {
        result = result.filter(f => f.category === category);
    }
    if (maxSpicy) {
        const maxSpicyNum = Number(maxSpicy);
        if (!isNaN(maxSpicyNum)) {
             result = result.filter(f => f.spicyLevel <= maxSpicyNum); 
        }
    }
    if (vegetarian) {
        result = result.filter(f => f.vegetarian === (vegetarian === 'true'));
    }

    res.json(result);
});

// ✅ GET /api/foods/:id: ดึงเมนูตาม ID
router.get('/:id', (req, res) => {
    try {
        const foods = loadFoods();
        const id = Number(req.params.id);
        
        if (isNaN(id)) {
             return res.status(400).json({ success: false, message: 'Invalid food ID format.' });
        }
        
        const food = foods.find(f => f.id === id);

        if (!food) {
            return res.status(404).json({
                success: false,
                message: `Food with ID ${id} not found`
            });
        }

        res.json(food);
    } catch (error) {
        console.error('❌ Failed to get food by ID:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process request for food by ID',
            error: error.message
        });
    }
});

// =======================================================
// ✅ POST, PUT, DELETE Endpoints (Write Operations)
// =======================================================

// ✅ POST /api/foods: สร้างเมนูอาหารใหม่
router.post('/', (req, res) => {
    try {
        const foods = loadFoods();
        const newFoodData = req.body;
        
        // ตรวจสอบข้อมูลขั้นต่ำที่จำเป็น
        if (!newFoodData.name || !newFoodData.category || typeof newFoodData.price !== 'number') {
            return res.status(400).json({ 
                success: false, 
                message: 'Missing required fields: name, category, and price are mandatory.' 
            });
        }

        // สร้าง ID ใหม่ (ใช้ ID สูงสุด + 1)
        const newId = foods.length > 0 ? Math.max(...foods.map(f => f.id)) + 1 : 1;

        const newFood = {
            id: newId,
            name: newFoodData.name,
            category: newFoodData.category,
            price: newFoodData.price,
            description: newFoodData.description || '',
            spicyLevel: newFoodData.spicyLevel !== undefined ? newFoodData.spicyLevel : 0,
            vegetarian: newFoodData.vegetarian === true,
            available: newFoodData.available !== undefined ? newFoodData.available : true,
            cookingTime: newFoodData.cookingTime || 10,
            ingredients: newFoodData.ingredients || []
        };

        foods.push(newFood);
        saveFoods(foods); // บันทึกข้อมูล
        
        res.status(201).json({ 
            success: true, 
            message: 'Food menu created successfully',
            food: newFood 
        });

    } catch (error) {
        console.error('❌ Failed to create new food menu:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error during creation.' });
    }
});

// ✅ PUT /api/foods/:id: อัปเดตเมนูอาหารที่มีอยู่
router.put('/:id', (req, res) => {
    try {
        let foods = loadFoods();
        const id = Number(req.params.id);
        const updateData = req.body;

        if (isNaN(id)) {
            return res.status(400).json({ success: false, message: 'Invalid food ID format.' });
        }
        
        const foodIndex = foods.findIndex(f => f.id === id);

        if (foodIndex === -1) {
            return res.status(404).json({ success: false, message: `Food with ID ${id} not found` });
        }

        // อัปเดตข้อมูล (อนุญาตให้อัปเดตบางฟิลด์เท่านั้น)
        foods[foodIndex] = {
            ...foods[foodIndex],
            ...updateData,
            id: id // ป้องกันไม่ให้ ID ถูกเปลี่ยน
        };
        
        saveFoods(foods); // บันทึกข้อมูล
        
        res.json({
            success: true,
            message: `Food with ID ${id} updated successfully`,
            food: foods[foodIndex]
        });

    } catch (error) {
        console.error('❌ Failed to update food menu:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error during update.' });
    }
});

// ✅ DELETE /api/foods/:id: ลบเมนูอาหาร
router.delete('/:id', (req, res) => {
    try {
        let foods = loadFoods();
        const id = Number(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({ success: false, message: 'Invalid food ID format.' });
        }
        
        const initialLength = foods.length;
        // กรองเอาอาหารที่ไม่ต้องการลบออก
        foods = foods.filter(f => f.id !== id);

        if (foods.length === initialLength) {
            return res.status(404).json({ success: false, message: `Food with ID ${id} not found` });
        }
        
        saveFoods(foods); // บันทึกข้อมูลที่ถูกลบแล้ว
        
        res.status(200).json({ 
            success: true, 
            message: `Food with ID ${id} deleted successfully` 
        });

    } catch (error) {
        console.error('❌ Failed to delete food menu:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error during deletion.' });
    }
});


// ✅ export ทั้ง router และ function โหลดข้อมูล
module.exports = {
    router: router,
    loadFoods: loadFoods,
    saveFoods: saveFoods // Export saveFoods ด้วยเผื่อต้องการใช้ในส่วนอื่น
};
