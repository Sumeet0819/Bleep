import { createAsyncThunk } from '@reduxjs/toolkit';
import { instance } from '../../utils/apiConfig';

export const loadReminders = createAsyncThunk(
  'reminders/loadReminders',
  async (userId) => {
    try {
      const res = await instance.get(`/reminders/${userId}`, {
      });
      return res.data.reminders;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
);

export const addReminder = createAsyncThunk(
  'reminders/addReminder',
  async ({ reminder, date, userId }) => {
    try {
      const res = await instance.post('/reminders', { reminder, date, userId });
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
      return reminderId;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
);