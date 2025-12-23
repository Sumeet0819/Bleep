import { configureStore } from "@reduxjs/toolkit";
import userSlice from "./reducers/userSlice";
import remindersSlice from "./reducers/remindersSlice";


export const store= configureStore ({
    reducer:{
        user:userSlice,
        reminders: remindersSlice,
    },
})