const express = require('express');
const router = express.Router();
const {createReminder , getReminders, deleteReminder} = require('../controllers/reminder.controller');

router.post('/reminders', createReminder);
router.get('/reminders/:userId', getReminders);
router.delete('/reminders/:reminderId', deleteReminder);

module.exports = router;
