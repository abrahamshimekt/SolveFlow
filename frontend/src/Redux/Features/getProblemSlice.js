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
  data: {},
};

export const getProblem = createAsyncThunk(
  "Problem/Get-Problem",
  async ({ id,conversationId, onSuccess }, { rejectWithValue }) => {
    try {
      let token = getCookie("token");
      setAuthToken(token);
      const response = await axios.get(`${BASE_URL}/api/user/problems/${id}`);
      onSuccess && onSuccess(response?.data?.data || undefined,conversationId);
      return response?.data;
    } catch (error) {
      // console.log(error?.message);
      axiosErrorHandler(error);
      return rejectWithValue(error?.response?.data);
    }
  }
);

const getProblemSlice = createSlice({
  name: "Get Problem",
  initialState: initialState,
  reducers: {
    resetProblemData: (state, action) => {
      state.data = {};
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getProblem.pending, (state) => {
      state.isLoading = true;
      state.isSuccess = false;
    });
    builder.addCase(getProblem.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isError = false;
      state.errors = [];
      state.isSuccess = action?.payload?.success;
      state.message = action?.payload?.message;
      state.data = action?.payload?.data;
    });
    builder.addCase(getProblem.rejected, (state, action) => {
      state.isLoading = false;
      state.errors = action.payload?.errors || [];
      state.isError = true;
    });
  },
});

export const { resetProblemData } = getProblemSlice?.actions;

export default getProblemSlice?.reducer;
