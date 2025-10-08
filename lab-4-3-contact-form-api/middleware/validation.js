// Contact form validation
const validateContact = (req, res, next) => {
    const { name, email, subject, message, phone, company } = req.body;
    const errors = [];

    // ตรวจสอบ name
    if (!name || typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100) {
        errors.push('Name must be a string between 2 and 100 characters');
    }

    // ตรวจสอบ email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
        errors.push('Email is required and must be a valid email address');
    }

    // ตรวจสอบ subject
    if (!subject || typeof subject !== 'string' || subject.trim().length < 5 || subject.trim().length > 200) {
        errors.push('Subject must be between 5 and 200 characters');
    }

    // ตรวจสอบ message
    if (!message || typeof message !== 'string' || message.trim().length < 10 || message.trim().length > 1000) {
        errors.push('Message must be between 10 and 1000 characters');
    }

    // ตรวจสอบ phone (optional)
    const phoneRegex = /^[0-9]{9,10}$/;
    if (phone && !phoneRegex.test(phone.trim())) {
        errors.push('Phone number must be 9-10 digits if provided');
    }

    // ตรวจสอบ company (optional)
    if (company && company.trim().length > 100) {
        errors.push('Company name must not exceed 100 characters');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors
        });
    }

    // Sanitize data
    req.body.name = name.trim();
    req.body.email = email.trim().toLowerCase();
    req.body.subject = subject.trim();
    req.body.message = message.trim();
    if (phone) req.body.phone = phone.trim();
    if (company) req.body.company = company.trim();

    next();
};

// Feedback validation
const validateFeedback = (req, res, next) => {
    const { rating, comment, email } = req.body;
    const errors = [];

    // ตรวจสอบ rating
    if (rating === undefined || typeof rating !== 'number' || rating < 1 || rating > 5) {
        errors.push('Rating is required and must be a number between 1 and 5');
    }

    // ตรวจสอบ comment
    if (!comment || typeof comment !== 'string' || comment.trim().length < 5 || comment.trim().length > 500) {
        errors.push('Comment must be between 5 and 500 characters');
    }

    // ตรวจสอบ email (optional)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email.trim())) {
        errors.push('Email must be a valid email address if provided');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors
        });
    }

    // Sanitize
    req.body.comment = comment.trim();
    if (email) req.body.email = email.trim().toLowerCase();

    next();
};

module.exports = {
    validateContact,
    validateFeedback
};