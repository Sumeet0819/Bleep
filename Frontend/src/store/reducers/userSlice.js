import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    user: null,
};
const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        loaduser: (state, action) => {
            state.user = action.payload;
        },
    },
});
export const { loaduser } = userSlice.actions;
export default userSlice.reducer;   
