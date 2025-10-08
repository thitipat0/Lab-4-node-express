const http = require('http');
const url = require('url');

const PORT = 3000;

// ข้อมูลจำลอง
const students = [
    { id: 1, name: "Alice", major: "วิศวกรรม", year: 2 },
    { id: 2, name: "Bob", major: "คอมพิวเตอร์", year: 3 },
    { id: 3, name: "Charlie", major: "วิศวกรรม", year: 1 }
];

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const method = req.method;

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');

    // GET /
    if (method === 'GET' && pathname === '/') {
        res.end(JSON.stringify({
            message: "Welcome to HTTP Server",
            endpoints: [
                "GET /",
                "GET /students",
                "GET /students/:id",
                "GET /students/major/:major"
            ]
        }));
        return;
    }

    // GET /students
    if (method === 'GET' && pathname === '/students') {
        res.end(JSON.stringify(students));
        return;
    }

    // GET /students/:id
    const studentIdMatch = pathname.match(/^\/students\/(\d+)$/);
    if (method === 'GET' && studentIdMatch) {
        const id = parseInt(studentIdMatch[1]);
        const student = students.find(s => s.id === id);
        if (student) {
            res.end(JSON.stringify(student));
        } else {
            res.statusCode = 404;
            res.end(JSON.stringify({ error: "Student not found" }));
        }
        return;
    }

    // GET /students/major/:major
    const majorMatch = pathname.match(/^\/students\/major\/(.+)$/);
    if (method === 'GET' && majorMatch) {
        const major = decodeURIComponent(majorMatch[1]);
        const filtered = students.filter(s => s.major === major);
        res.end(JSON.stringify(filtered));
        return;
    }

    // 404 Not Found
    res.statusCode = 404;
    res.end(JSON.stringify({ error: "Route not found" }));
});

server.listen(PORT, () => {
    console.log(`🌐 HTTP Server running on http://localhost:${PORT}`);
    console.log('Available endpoints:');
    console.log('  GET /');
    console.log('  GET /students');
    console.log('  GET /students/:id');
    console.log('  GET /students/major/:major');
});
