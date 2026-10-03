const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
    text: { type: String, required: true },
    type: { type: String, enum: ['location', 'time'], required: true },
    location: {
        name: { type: String },
        latitude: { type: Number },
        longitude: { type: Number }
    },
    reminderTime: { type: Date },
    completed: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Reminder', reminderSchema);
