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

export const getAllProblems = createAsyncThunk(
  "Problem/Get-All-Problem",
  async (token, { rejectWithValue }) => {
    try {
      let token = getCookie("token");
      setAuthToken(token);
      const response = await axios.get(`${BASE_URL}/api/user/problems`);
      return response?.data;
    } catch (error) {
      console.log(error?.message);
      axiosErrorHandler(error);
      return rejectWithValue(error?.response?.data);
    }
  }
);

const getAllProblemsSlice = createSlice({
  name: "Get All Problem",
  initialState: initialState,
  reducers: {
    deleteProblemData: (state, action) => {
      state.data = state.data.filter(
        (problem) => problem._id !== action.payload
      );
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getAllProblems.pending, (state) => {
      state.isLoading = true;
      state.isSuccess = false;
    });
    builder.addCase(getAllProblems.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isError = false;
      state.errors = [];
      state.isSuccess = action?.payload?.success;
      state.message = action?.payload?.message;
      state.data = action?.payload?.data;
    });
    builder.addCase(getAllProblems.rejected, (state, action) => {
      state.isLoading = false;
      state.errors = action.payload?.errors || [];
      state.products = [];
      state.isError = true;
    });
  },
});
export const { deleteProblemData } = getAllProblemsSlice.actions;
export default getAllProblemsSlice?.reducer;
