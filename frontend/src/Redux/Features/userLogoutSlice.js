import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { BASE_URL } from "../../Config";
import axios from "axios";
import {
  axiosErrorHandler,
  getCookie,
} from "../../utils/helper";
import setAuthToken from "../../utils/setAuthToken";

const initialState = {
  isLoading: false,
  isError: null,
  errors: [],
  isSuccess: false,
  message: "",
};

export const userLogout = createAsyncThunk(
  "Auth/User-Logout",
  async ({ onSuccess }, { rejectWithValue }) => {
    try {
      let token = getCookie("token");
      setAuthToken(token);
      const response = await axios.get(`${BASE_URL}/api/auth/google/logout`);
      // toastSuccess(response?.data?.message);
      onSuccess && onSuccess();
      return response?.data;
    } catch (error) {
      axiosErrorHandler(error);
      // toastError(error?.response?.data?.errors[0]?.message || "Network error");
      return rejectWithValue(error?.response?.data);
    }
  }
);

const userLogoutSlice = createSlice({
  name: "User Logout",
  initialState: initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(userLogout.pending, (state) => {
      state.isLoading = true;
      state.isSuccess = false;
    });
    builder.addCase(userLogout.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isError = false;
      state.errors = [];
      state.isSuccess = action?.payload?.success;
      state.message = action?.payload?.message;
    });
    builder.addCase(userLogout.rejected, (state, action) => {
      state.isLoading = false;
      state.errors = action.payload?.errors || [];
      state.products = [];
      state.isError = true;
    });
  },
});

export default userLogoutSlice?.reducer;
