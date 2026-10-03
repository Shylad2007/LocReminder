const express = require('express');
const Reminder = require('../models/Reminder');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/', auth, async (req, res) => {
    try {
        const reminders = await Reminder.find({ userId: req.userId }).sort({ createdAt: -1 });
        res.json(reminders);
    } catch (err) {
        res.status(500).json({ error: 'Server Error' });
    }
});

router.post('/', auth, async (req, res) => {
    try {
        const reminderData = {
            ...req.body,
            userId: req.userId
        };
        const newReminder = new Reminder(reminderData);
        const savedReminder = await newReminder.save();
        res.status(201).json(savedReminder);
    } catch (err) {
        res.status(400).json({ error: 'Invalid data' });
    }
});

router.patch('/:id', auth, async (req, res) => {
    try {
        const updatedReminder = await Reminder.findOneAndUpdate(
            { _id: req.params.id, userId: req.userId },
            req.body,
            { new: true }
        );
        if (!updatedReminder) {
            return res.status(404).json({ error: 'Reminder not found or unauthorized' });
        }
        res.json(updatedReminder);
    } catch (err) {
        res.status(400).json({ error: 'Update failed' });
    }
});

router.delete('/:id', auth, async (req, res) => {
    try {
        const deletedReminder = await Reminder.findOneAndDelete({ _id: req.params.id, userId: req.userId });
        if (!deletedReminder) {
            return res.status(404).json({ error: 'Reminder not found or unauthorized' });
        }
        res.json({ message: 'Reminder deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Delete failed' });
    }
});

module.exports = router;
