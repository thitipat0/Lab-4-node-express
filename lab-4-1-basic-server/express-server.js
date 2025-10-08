const express = require('express');
const app = express();
const PORT = 3001;

// ข้อมูลจำลอง
const students = [
    { id: 1, name: "Alice", major: "วิศวกรรม", year: 2 },
    { id: 2, name: "Bob", major: "คอมพิวเตอร์", year: 3 },
    { id: 3, name: "Charlie", major: "วิศวกรรม", year: 1 }
];

// Middleware
app.use(express.json());

// GET /
app.get('/', (req, res) => {
    res.json({
        message: "Welcome to Express Server",
        endpoints: [
            "GET /",
            "GET /students",
            "GET /students/:id",
            "GET /students/major/:major",
            "GET /stats"
        ]
    });
});

// GET /students
app.get('/students', (req, res) => {
    res.json(students);
});

// GET /students/:id
app.get('/students/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const student = students.find(s => s.id === id);
    if (student) {
        res.json(student);
    } else {
        res.status(404).json({ error: "Student not found" });
    }
});

// GET /students/major/:major
app.get('/students/major/:major', (req, res) => {
    const major = req.params.major;
    const filtered = students.filter(s => s.major === major);
    res.json(filtered);
});

// GET /stats
app.get('/stats', (req, res) => {
    const total = students.length;
    const majors = {};
    students.forEach(s => {
        majors[s.major] = (majors[s.major] || 0) + 1;
    });
    res.json({ totalStudents: total, studentsPerMajor: majors });
});

// 404 Middleware
app.use((req, res) => {
    res.status(404).json({ error: "Route not found" });
});

app.listen(PORT, () => {
    console.log(`🚀 Express Server running on http://localhost:${PORT}`);
    console.log('Available endpoints:');
    console.log('  GET /');
    console.log('  GET /students'); 
    console.log('  GET /students/:id');
    console.log('  GET /students/major/:major');
    console.log('  GET /stats');
});
