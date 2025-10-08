// Global variables
let isSubmitting = false;

// DOM Elements
const contactForm = document.getElementById('contactForm');
const feedbackForm = document.getElementById('feedbackForm');
const statusMessages = document.getElementById('statusMessages');
const apiResults = document.getElementById('apiResults');
const ratingSlider = document.getElementById('rating');
const ratingValue = document.getElementById('ratingValue');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeForms();
    setupEventListeners();
});

function initializeForms() {
    // Update rating display
    ratingSlider.addEventListener('input', () => {
        ratingValue.textContent = ratingSlider.value;
    });
}

// Real-time validation
function setupEventListeners() {
    // Contact form submission
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await submitContactForm();
    });

    // Feedback form submission
    feedbackForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await submitFeedbackForm();
    });

    // Real-time validation for contact form
    contactForm.querySelectorAll('input, textarea').forEach(input => {
        input.addEventListener('input', () => {
            const { isValid, message } = validateField(input.name, input.value);
            if (!isValid) {
                input.classList.add('invalid');
                input.title = message;
            } else {
                input.classList.remove('invalid');
                input.title = '';
            }
        });
    });

    // Real-time validation for feedback form
    feedbackForm.querySelectorAll('input, textarea').forEach(input => {
        input.addEventListener('input', () => {
            const { isValid, message } = validateField(input.name, input.value);
            if (!isValid) {
                input.classList.add('invalid');
                input.title = message;
            } else {
                input.classList.remove('invalid');
                input.title = '';
            }
        });
    });
}

// Client-side validation
function validateField(fieldName, value) {
    value = value.trim();
    switch (fieldName) {
        case 'name':
            if (!value) return { isValid: false, message: 'กรุณากรอกชื่อ' };
            if (value.length < 2) return { isValid: false, message: 'ชื่อต้องมีอย่างน้อย 2 ตัวอักษร' };
            if (value.length > 100) return { isValid: false, message: 'ชื่อต้องไม่เกิน 100 ตัวอักษร' };
            return { isValid: true, message: '' };
        case 'email':
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!value) return { isValid: false, message: 'กรุณากรอกอีเมล' };
            if (!emailRegex.test(value)) return { isValid: false, message: 'อีเมลไม่ถูกต้อง' };
            return { isValid: true, message: '' };
        case 'subject':
            if (!value) return { isValid: false, message: 'กรุณากรอกหัวข้อ' };
            if (value.length < 5) return { isValid: false, message: 'หัวข้อต้องมีอย่างน้อย 5 ตัวอักษร' };
            if (value.length > 200) return { isValid: false, message: 'หัวข้อต้องไม่เกิน 200 ตัวอักษร' };
            return { isValid: true, message: '' };
        case 'message':
            if (!value) return { isValid: false, message: 'กรุณากรอกข้อความ' };
            if (value.length < 10) return { isValid: false, message: 'ข้อความต้องมีอย่างน้อย 10 ตัวอักษร' };
            if (value.length > 1000) return { isValid: false, message: 'ข้อความต้องไม่เกิน 1000 ตัวอักษร' };
            return { isValid: true, message: '' };
        case 'phone':
            if (value && !/^[0-9]{9,10}$/.test(value)) return { isValid: false, message: 'เบอร์โทรไม่ถูกต้อง' };
            return { isValid: true, message: '' };
        case 'company':
            if (value.length > 100) return { isValid: false, message: 'ชื่อบริษัทต้องไม่เกิน 100 ตัวอักษร' };
            return { isValid: true, message: '' };
        case 'rating':
            const num = parseInt(value);
            if (isNaN(num) || num < 1 || num > 5) return { isValid: false, message: 'คะแนนต้องระหว่าง 1-5' };
            return { isValid: true, message: '' };
        case 'comment':
            if (!value) return { isValid: false, message: 'กรุณากรอกความคิดเห็น' };
            if (value.length < 5) return { isValid: false, message: 'ความคิดเห็นต้องมีอย่างน้อย 5 ตัวอักษร' };
            if (value.length > 500) return { isValid: false, message: 'ความคิดเห็นต้องไม่เกิน 500 ตัวอักษร' };
            return { isValid: true, message: '' };
        default:
            return { isValid: true, message: '' };
    }
}

// ✅ Contact form submission (เพิ่มส่วนนี้เข้าไป)
async function submitContactForm() {
    if (isSubmitting) return;

    const formData = new FormData(contactForm);
    const data = Object.fromEntries(formData.entries());

    try {
        isSubmitting = true;
        updateSubmitButton('contactSubmit', 'กำลังส่ง...', true);

        const response = await fetch('/api/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {
            showStatusMessage('✅ ส่งข้อความติดต่อสำเร็จ! ขอบคุณที่ติดต่อเรา', 'success');
            contactForm.reset();
        } else {
            showStatusMessage(`❌ เกิดข้อผิดพลาด: ${result.message}`, 'error');
            if (result.errors) displayValidationErrors(result.errors);
        }
    } catch (error) {
        showStatusMessage('❌ เกิดข้อผิดพลาดในการเชื่อมต่อ', 'error');
        console.error('Error:', error);
    } finally {
        isSubmitting = false;
        updateSubmitButton('contactSubmit', 'ส่งข้อความ', false);
    }
}

// Feedback form submission
async function submitFeedbackForm() {
    if (isSubmitting) return;
    
    const formData = new FormData(feedbackForm);
    const data = Object.fromEntries(formData.entries());
    data.rating = parseInt(data.rating);

    try {
        isSubmitting = true;
        updateSubmitButton('feedbackSubmit', 'กำลังส่ง...', true);

        const response = await fetch('/api/feedback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {
            showStatusMessage('✅ ส่งความคิดเห็นสำเร็จ! ขอบคุณสำหรับคำติชม', 'success');
            feedbackForm.reset();
            ratingValue.textContent = 3; // Reset slider display
        } else {
            showStatusMessage(`❌ เกิดข้อผิดพลาด: ${result.message}`, 'error');
            if (result.errors) displayValidationErrors(result.errors);
        }
    } catch (error) {
        showStatusMessage('❌ เกิดข้อผิดพลาดในการเชื่อมต่อ', 'error');
        console.error('Error:', error);
    } finally {
        isSubmitting = false;
        updateSubmitButton('feedbackSubmit', 'ส่งความคิดเห็น', false);
    }
}

// Load contacts from API
async function loadContacts() {
    try {
        apiResults.textContent = 'Loading contacts...';
        const response = await fetch('/api/contact');
        const data = await response.json();
        if (data.success) {
            apiResults.textContent = JSON.stringify(data.data, null, 2);
        } else {
            apiResults.textContent = 'Failed to load contacts';
        }
    } catch (error) {
        apiResults.textContent = 'Error loading contacts: ' + error.message;
    }
}

// Load feedback stats from API
async function loadFeedbackStats() {
    try {
        apiResults.textContent = 'Loading feedback stats...';
        const response = await fetch('/api/feedback/stats');
        const data = await response.json();
        if (data.success) {
            apiResults.textContent = JSON.stringify(data, null, 2);
        } else {
            apiResults.textContent = 'Failed to load feedback stats';
        }
    } catch (error) {
        apiResults.textContent = 'Error loading feedback stats: ' + error.message;
    }
}

// Load API status
async function loadAPIStatus() {
    try {
        apiResults.textContent = 'Loading API status...';
        const response = await fetch('/api/status');
        const data = await response.json();
        if (data.success) {
            apiResults.textContent = JSON.stringify(data, null, 2);
        } else {
            apiResults.textContent = 'Failed to load API status';
        }
    } catch (error) {
        apiResults.textContent = 'Error loading API status: ' + error.message;
    }
}

// Utility functions
function showStatusMessage(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `status-message ${type}`;
    messageDiv.textContent = message;
    statusMessages.appendChild(messageDiv);
    setTimeout(() => messageDiv.remove(), 5000);
}

function updateSubmitButton(buttonId, text, disabled) {
    const button = document.getElementById(buttonId);
    button.textContent = text;
    button.disabled = disabled;
}

function displayValidationErrors(errors) {
    errors.forEach(error => {
        showStatusMessage(`🔸 ${error}`, 'error');
    });
}

// Load API documentation
async function loadAPIDocs() {
    try {
        apiResults.textContent = 'Loading API docs...';
        const response = await fetch('/api/docs');
        const data = await response.text(); // assume it's HTML/text
        apiResults.innerHTML = data;
    } catch (error) {
        apiResults.textContent = 'Error loading API docs: ' + error.message;
    }
}

async function loadContacts() {
    const button = event.target;
    button.disabled = true;
    button.textContent = '⏳ กำลังโหลด...';
    try {
        apiResults.textContent = 'Loading contacts...';
        const response = await fetch('/api/contact');
        const data = await response.json();
        apiResults.textContent = JSON.stringify(data, null, 2);
    } catch (error) {
        apiResults.textContent = 'Error loading contacts: ' + error.message;
    } finally {
        button.disabled = false;
        button.textContent = '📋 ดูข้อมูลติดต่อ';
    }
}