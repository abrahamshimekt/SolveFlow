import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { BASE_URL } from "../../Config";
import axios from "axios";
import { axiosErrorHandler, getCookie } from "../../utils/helper";
import setAuthToken from "../../utils/setAuthToken";

const initialState = {
  isLoading: false,
  isError: null,
  errors: [],
  isSuccess: false,
  message: "",
};

export const restartProblem = createAsyncThunk(
  "Problem/Restart-Problem",
  async ({ id, onSuccess }, { rejectWithValue }) => {
    try {
      let token = getCookie("token");
      setAuthToken(token);
      const response = await axios.put(
        `${BASE_URL}/api/user/chats/restart/${id}`
      );
      onSuccess && onSuccess();
      return response?.data;
    } catch (error) {
      console.log(error?.message);
      axiosErrorHandler(error);
      return rejectWithValue(error?.response?.data);
    }
  }
);

const restartProblemSlice = createSlice({
  name: "Restart Problem",
  initialState: initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(restartProblem.pending, (state) => {
      state.isLoading = true;
      state.isSuccess = false;
    });
    builder.addCase(restartProblem.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isError = false;
      state.errors = [];
      state.isSuccess = action?.payload?.success;
      state.message = action?.payload?.message;
    });
    builder.addCase(restartProblem.rejected, (state, action) => {
      state.isLoading = false;
      state.errors = action.payload?.errors || [];
      state.products = [];
      state.isError = true;
    });
  },
});

export default restartProblemSlice?.reducer;
