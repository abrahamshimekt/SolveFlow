import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { BASE_URL } from "../../Config";
import axios from "axios";
import {  toastSuccess } from "../../utils/toast";
import { axiosErrorHandler, getCookie } from "../../utils/helper";
import setAuthToken from "../../utils/setAuthToken";

const initialState = {
  isLoading: false,
  isError: null,
  errors: [],
  isSuccess: false,
  message: "",
};

export const addProblem = createAsyncThunk(
  "Problem/Add-Problem",
  async ({ data, onSuccess }, { rejectWithValue }) => {
    try {
      let token = getCookie("token");
      setAuthToken(token);
      const response = await axios.post(`${BASE_URL}/api/user/problems`, data);
      onSuccess && onSuccess();
      toastSuccess(response?.data?.message);
      return response?.data;
    } catch (error) {
      // toastError(error?.response?.data?.errors[0]?.message || "Network error");
      axiosErrorHandler(error);
      return rejectWithValue(error?.response?.data);
    }
  }
);

const addProblemSlice = createSlice({
  name: "Add Problem",
  initialState: initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(addProblem.pending, (state) => {
      state.isLoading = true;
      state.isSuccess = false;
    });
    builder.addCase(addProblem.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isError = false;
      state.errors = [];
      state.isSuccess = action?.payload?.success;
      state.message = action?.payload?.message;
    });
    builder.addCase(addProblem.rejected, (state, action) => {
      state.isLoading = false;
      state.errors = action.payload?.errors || [];
      state.products = [];
      state.isError = true;
    });
  },
});

export default addProblemSlice?.reducer;
