import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { BASE_URL } from "../../Config";
import axios from "axios";
import { axiosErrorHandler } from "../../utils/helper";

const initialState = {
  isLoading: false,
  isError: null,
  errors: [],
  isSuccess: false,
  message: "",
  data: [],
};

export const getLibrary = createAsyncThunk(
  "Library/Get-Library",
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/api/user/library`);
      return response?.data;
    } catch (error) {
      console.log(error?.message);
      axiosErrorHandler(error);
      return rejectWithValue(error?.response?.data);
    }
  }
);

const getLibrarySlice = createSlice({
  name: "Get Library",
  initialState: initialState,
  reducers: {
    resetProblemData: (state, action) => {
      state.data = {};
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getLibrary.pending, (state) => {
      state.isLoading = true;
      state.isSuccess = false;
    });
    builder.addCase(getLibrary.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isError = false;
      state.errors = [];
      state.isSuccess = action?.payload?.success;
      state.message = action?.payload?.message;
      state.data = action?.payload?.data;
    });
    builder.addCase(getLibrary.rejected, (state, action) => {
      state.isLoading = false;
      state.errors = action.payload?.errors || [];
      state.products = [];
      state.isError = true;
    });
  },
});

export const { resetProblemData } = getLibrarySlice?.actions;

export default getLibrarySlice?.reducer;
