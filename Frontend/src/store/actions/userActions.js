import { instance } from "../../utils/apiConfig";
import { loaduser, setError } from "../reducers/userSlice";

export const asyncLoginUser = (user) => async (dispatch, getState) => {
  try {
    const res = await instance.post("/auth/login", user);
    dispatch(loaduser(res.data.user));
  } catch (error) {
    console.log(error);
    dispatch(setError(error.response?.data?.message || "Something went wrong"));
  }
};

export const asyncLogoutUser = () => async (dispatch, getState) => {
  try {
    dispatch(loaduser(null));
  } catch (error) {
    console.log(error);
  }
};