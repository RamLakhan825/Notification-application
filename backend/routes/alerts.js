const express = require('express');
const router = express.Router();
const Alert = require('../models/Alert');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { io } = require('../server');

// Middleware to verify admin
const adminAuth = async (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    try {
        const decoded = jwt.verify(token, 'your_jwt_secret');
        const user = await User.findById(decoded.id);
        if (!user || user.role !== 'admin') return res.status(403).json({ message: 'Not authorized' });
        req.user = user;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Invalid token' });
    }
};

// Create alert
router.post('/', adminAuth, async (req, res) => {
    try {
        const alert = new Alert(req.body);
        await alert.save();
    //     const userIds = req.body.visibility.organization
    //   ? (await User.find().select('_id')).map(u => u._id)
    //   : req.body.visibility.users;

    // userIds.forEach(id => {
    //   io.to(id.toString()).emit('newAlert', alert); // real-time event
    // });
    //     res.json({ message: 'Alert created', alert });
    let userIds = [];
    if (req.body.visibility.organization) {
      userIds = (await User.find().select('_id')).map(u => u._id);
    } else {
      userIds = req.body.visibility.users;
    }
    userIds.forEach(id => io.to(id.toString()).emit('newAlert', alert));

    res.json({ message: 'Alert created', alert });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update alert
router.put('/:id', adminAuth, async (req, res) => {
    try {
        const alert = await Alert.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!alert) return res.status(404).json({ message: 'Alert not found' });
        res.json({ message: 'Alert updated', alert });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Archive/disable alert
router.delete('/:id', adminAuth, async (req, res) => {
    try {
        const alert = await Alert.findByIdAndUpdate(req.params.id, { active: false }, { new: true });
        if (!alert) return res.status(404).json({ message: 'Alert not found' });
        res.json({ message: 'Alert archived', alert });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// List all alerts with optional filters
router.get('/', adminAuth, async (req, res) => {
    try {
        const { severity, status } = req.query;
        const filter = {};
        if (severity) filter.severity = severity;
        if (status === 'active') filter.active = true;
        if (status === 'expired') filter.expiryTime = { $lt: new Date() };

        const alerts = await Alert.find(filter).populate('visibility.users', 'name email');
        res.json(alerts);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
