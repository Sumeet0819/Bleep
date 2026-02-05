const reminderSchema = require('../models/reminders.model');

async function createReminder(req, res) { 
    const { userId, reminder, date, tag } = req.body;

    const newReminder = new reminderSchema({ userId, reminder, date, tag });
    await newReminder.save();

    res.status(201).json({ message: 'Reminder created successfully', reminder: newReminder });
}

async function getReminders(req, res) {
    const { userId } = req.params;

    const reminders = await reminderSchema.find({ userId });

    res.status(200).json({ reminders });
}

async function deleteReminder(req, res) {
    const { reminderId } = req.params;

    const deletedReminder = await reminderSchema.findOneAndDelete({ _id: reminderId });

    if (!deletedReminder) {
        return res.status(404).json({ message: 'Reminder not found' });
    }

    res.status(200).json({ message: 'Reminder deleted successfully' });
}


module.exports = { createReminder, getReminders, deleteReminder };  