import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { BASE_URL } from "../../Config";
import axios from "axios";
import { axiosErrorHandler, removeCookie, setCookie } from "../../utils/helper";

const initialState = {
  isLoading: false,
  isError: null,
  errors: [],
  isSuccess: false,
  message: "",
  user: {},
};

export const getUser = createAsyncThunk(
  "User/Get-User",
  async (token, { rejectWithValue }) => {
    try {
      // setAuthToken(token);
      const response = await axios.get(`${BASE_URL}/api/user`);
      setCookie("userId", response?.data?.data?._id);
      return response?.data;
    } catch (error) {
      axiosErrorHandler(error);
      return rejectWithValue(error?.response?.data);
    }
  }
);

const getUserSlice = createSlice({
  name: "Get User",
  initialState: initialState,
  reducers: {
    logout: (state, action) => {
      removeCookie("token");
      state.user = {};
      state.message = "";
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getUser.pending, (state) => {
      state.isLoading = true;
      state.isSuccess = false;
    });
    builder.addCase(getUser.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isError = false;
      state.errors = [];
      state.isSuccess = action?.payload?.success;
      state.message = action?.payload?.message;
      state.user = action?.payload?.data;
    });
    builder.addCase(getUser.rejected, (state, action) => {
      state.isLoading = false;
      state.errors = action.payload?.errors || [];
      state.products = [];
      state.isError = true;
    });
  },
});

export const { logout } = getUserSlice?.actions;

export default getUserSlice?.reducer;
