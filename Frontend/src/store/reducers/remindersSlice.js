import { createSlice } from '@reduxjs/toolkit';
import { addReminder, deleteReminder, loadReminders } from '../actions/reminderActions';

const initialState = {
  reminders: [],
  loading: false,
  error: null,
};

const remindersSlice = createSlice({
  name: 'reminders',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadReminders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadReminders.fulfilled, (state, action) => {
        state.loading = false;
        state.reminders = action.payload;
      })
      .addCase(loadReminders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(addReminder.fulfilled, (state, action) => {
        state.reminders.push(action.payload);
      })
      .addCase(deleteReminder.fulfilled, (state, action) => {
        state.reminders = state.reminders.filter(
          (reminder) => reminder._id !== action.payload
        );
      });
  },
});

export default remindersSlice.reducer;
