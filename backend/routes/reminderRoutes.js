const express = require('express');
const Reminder = require('../models/Reminder');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const reminders = await Reminder.find().sort({ createdAt: -1 });
        res.json(reminders);
    } catch (err) {
        res.status(500).json({ error: 'Server Error' });
    }
});

router.post('/', async (req, res) => {
    try {
        const newReminder = new Reminder(req.body);
        const savedReminder = await newReminder.save();
        res.status(201).json(savedReminder);
    } catch (err) {
        res.status(400).json({ error: 'Invalid data' });
    }
});

router.patch('/:id', async (req, res) => {
    try {
        const updatedReminder = await Reminder.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.json(updatedReminder);
    } catch (err) {
        res.status(400).json({ error: 'Update failed' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await Reminder.findByIdAndDelete(req.params.id);
        res.json({ message: 'Reminder deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Delete failed' });
    }
});

module.exports = router;
