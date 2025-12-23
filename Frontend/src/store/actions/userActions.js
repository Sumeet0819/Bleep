import { instance } from "../../utils/apiConfig";
import { loaduser } from "../reducers/userSlice";

export const asyncLoginUser = (user) => async (dispatch, getState) => {
  try {
    const res = await instance.post("/auth/login", user);
    dispatch(loaduser(res.data.user));
  } catch (error) {
    console.log(error);
  }
};
