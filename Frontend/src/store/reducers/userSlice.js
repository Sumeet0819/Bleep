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
            state.error = null;
        },
        logout: (state) => {
            state.user = null;
            state.error = null;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
    },
});
export const { loaduser, logout, setError } = userSlice.actions;
export default userSlice.reducer;   
