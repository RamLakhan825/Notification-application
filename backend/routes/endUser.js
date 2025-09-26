const express = require('express');
const router = express.Router();
const Alert = require('../models/Alert');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Middleware to verify end-user
const userAuth = async (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, 'your_jwt_secret');
    const user = await User.findById(decoded.id);
    if (!user) return res.status(403).json({ message: 'Not authorized' });
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// GET all active alerts for logged-in user
router.get('/alerts', userAuth, async (req, res) => {
  try {
    const now = new Date();

    const alerts = await Alert.find({
      active: true,
      $or: [
        { 'visibility.organization': true },
        { 'visibility.users': req.user._id },
        { 'visibility.teams': { $in: req.user.teams || [] } }
      ],
      $or: [
        { expiryTime: { $exists: false } },
        { expiryTime: { $gt: now } }
      ]
    }).lean();

    // Exclude alerts snoozed for today
    const filtered = alerts.filter(a => {
      const snoozed = a.snoozedUsers?.find(
        s => s.user.toString() === req.user._id.toString() &&
             new Date(s.snoozedDate).toDateString() === now.toDateString()
      );
      return !snoozed;
    });

    res.json(filtered);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Snooze an alert for today
router.post('/alerts/:id/snooze', userAuth, async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);
    if (!alert) return res.status(404).json({ message: 'Alert not found' });

    const today = new Date();
    alert.snoozedUsers = alert.snoozedUsers.filter(
      s => !s.user.equals(req.user._id)
    );
    alert.snoozedUsers.push({ user: req.user._id, snoozedDate: today });

    await alert.save();
    res.json({ message: 'Alert snoozed for today' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark alert as read
router.post('/alerts/:id/read', userAuth, async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);
    if (!alert) return res.status(404).json({ message: 'Alert not found' });

    if (!alert.readBy.some(u => u.equals(req.user._id))) {
      alert.readBy.push(req.user._id);
      await alert.save();  // <-- This was missing
    }

    res.json({ message: 'Alert marked as read' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
