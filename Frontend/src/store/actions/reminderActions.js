import { createAsyncThunk } from '@reduxjs/toolkit';
import { instance } from '../../utils/apiConfig';
import notificationService from '../../services/notificationService';

export const loadReminders = createAsyncThunk(
  'reminders/loadReminders',
  async (userId) => {
    try {
      const res = await instance.get(`/reminders/${userId}`, {
      });
      
      // Schedule notifications for all loaded reminders
      if (res.data.reminders && res.data.reminders.length > 0) {
        await notificationService.scheduleMultipleReminders(res.data.reminders);
      }
      
      return res.data.reminders;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
);

export const addReminder = createAsyncThunk(
  'reminders/addReminder',
  async ({ reminder, date, userId, tag }) => {
    try {
      const res = await instance.post('/reminders', { reminder, date, userId, tag });
      
      // Schedule notification for the new reminder
      if (res.data.reminder) {
        await notificationService.scheduleReminder(res.data.reminder);
      }
      
      return res.data.reminder;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
);

export const deleteReminder = createAsyncThunk(
  'reminders/deleteReminder',
  async (reminderId) => {
    try {
      await instance.delete(`/reminders/${reminderId}`);
      
      // Cancel the notification for this reminder
      await notificationService.cancelReminder(reminderId);
      
      return reminderId;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
);