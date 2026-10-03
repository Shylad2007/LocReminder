const express = require('express');
const Location = require('../models/Location');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/', auth, async (req, res) => {
    try {
        const locations = await Location.find({ userId: req.userId }).sort({ createdAt: -1 });
        res.json(locations);
    } catch (err) {
        res.status(500).json({ error: 'Server Error' });
    }
});

router.post('/', auth, async (req, res) => {
    try {
        const locationData = {
            ...req.body,
            userId: req.userId
        };
        const newLocation = new Location(locationData);
        const savedLocation = await newLocation.save();
        res.status(201).json(savedLocation);
    } catch (err) {
        res.status(400).json({ error: 'Invalid data' });
    }
});

router.delete('/:id', auth, async (req, res) => {
    try {
        const deletedLocation = await Location.findOneAndDelete({ _id: req.params.id, userId: req.userId });
        if (!deletedLocation) {
            return res.status(404).json({ error: 'Location not found or unauthorized' });
        }
        res.json({ message: 'Location deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Delete failed' });
    }
});

module.exports = router;
