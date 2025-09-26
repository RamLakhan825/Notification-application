const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const ADMIN_EMAIL = 'admin@gmail.com';
const JWT_SECRET = 'your_jwt_secret'; // replace with env variable in production

// Register user
router.post('/register', async (req, res) => {
    try {
        let { name, email, password,phone, role } = req.body;
        email = email.toLowerCase(); // normalize email

        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ message: 'User already exists' });

        const userRole = (email === ADMIN_EMAIL) ? 'admin' : 'user';

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            name,
            email,
            password: hashedPassword,
            phone,
            role: userRole
        });

        await user.save();
        res.json({ message: `Registered successfully as ${userRole}` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Login user
router.post('/login', async (req, res) => {
    try {
        let { email, password } = req.body;
        email = email.toLowerCase(); // normalize email

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid email or password' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' });

        const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, role: user.role });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
