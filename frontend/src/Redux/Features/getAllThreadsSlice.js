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
  data: [],
};

export const getAllThreads = createAsyncThunk(
  "Threads/Get-All-Threads",
  async (data, { rejectWithValue }) => {
    try {
      let token = getCookie("token");
      setAuthToken(token);
      const response = await axios.get(`${BASE_URL}/api/user/threads`);
      return response?.data;
    } catch (error) {
      console.log(error?.message);
      axiosErrorHandler(error);
      return rejectWithValue(error?.response?.data);
    }
  }
);

const getAllThreadsSlice = createSlice({
  name: "Get All Threads",
  initialState: initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getAllThreads.pending, (state) => {
      state.isLoading = true;
      state.isSuccess = false;
    });
    builder.addCase(getAllThreads.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isError = false;
      state.errors = [];
      state.isSuccess = action?.payload?.success;
      state.message = action?.payload?.message;
      state.data = action?.payload?.data;
    });
    builder.addCase(getAllThreads.rejected, (state, action) => {
      state.isLoading = false;
      state.errors = action.payload?.errors || [];
      state.products = [];
      state.isError = true;
    });
  },
});

export default getAllThreadsSlice?.reducer;
