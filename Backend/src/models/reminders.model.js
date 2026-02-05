const mongoose = require('mongoose');


const reminderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reminder:{
        type: String,
        required: true
    },
    date:{
        type: Date,
        required: true
    },
    tag:{
        type: String,
        default: 'General',
        enum: ['Work', 'Personal', 'Health', 'Shopping', 'Study', 'General']
    }
})

module.exports = mongoose.model('Reminder', reminderSchema);