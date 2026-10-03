const express = require('express');
const Location = require('../models/Location');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const locations = await Location.find().sort({ createdAt: -1 });
        res.json(locations);
    } catch (err) {
        res.status(500).json({ error: 'Server Error' });
    }
});

router.post('/', async (req, res) => {
    try {
        const newLocation = new Location(req.body);
        const savedLocation = await newLocation.save();
        res.status(201).json(savedLocation);
    } catch (err) {
        res.status(400).json({ error: 'Invalid data' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await Location.findByIdAndDelete(req.params.id);
        res.json({ message: 'Location deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Delete failed' });
    }
});

module.exports = router;
