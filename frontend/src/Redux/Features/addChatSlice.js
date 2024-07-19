import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { BASE_URL } from "../../Config";
import axios from "axios";
import { toastSuccess } from "../../utils/toast";
import { axiosErrorHandler, getCookie } from "../../utils/helper";
import setAuthToken from "../../utils/setAuthToken";

const initialState = {
  isLoading: false,
  isError: null,
  errors: [],
  isSuccess: false,
  message: "",
  status: "",
  data: {},
};

export const addChat = createAsyncThunk(
  "Chat/Add-Chat",
  async (
    {
      role,
      content,
      humanCheckerAnswer,
      additionalInformation,
      conversationId,
      debugLevel,
      action,
      onError,
      id,
      onSuccess,
    },
    { rejectWithValue }
  ) => {
    try {
      let token = getCookie("token");
      setAuthToken(token);
      const response = await axios.post(`${BASE_URL}/api/user/chats/${id}`, {
        role,
        content,
        humanCheckerAnswer,
        additionalInformation,
        conversationId,
        debugLevel,
        action,
      });
      onSuccess && onSuccess(response?.data);
      toastSuccess(response?.data?.message);
      return response?.data;
    } catch (error) {
      // toastError(error?.response?.data?.errors[0]?.message || "Network error");
      onError && onError();
      axiosErrorHandler(error);
      return rejectWithValue(error?.response?.data);
    }
  }
);

const addChatSlice = createSlice({
  name: "Add Chat",
  initialState: initialState,
  reducers: {
    resetChatData: (state, action) => {
      state.data = {};
    },
  },
  extraReducers: (builder) => {
    builder.addCase(addChat.pending, (state) => {
      state.isLoading = true;
      state.isSuccess = false;
    });
    builder.addCase(addChat.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isError = false;
      state.errors = [];
      state.isSuccess = action?.payload?.success;
      state.message = action?.payload?.message;
      state.status = action?.payload?.status;
      state.data = action?.payload?.data;
    });
    builder.addCase(addChat.rejected, (state, action) => {
      state.isLoading = false;
      state.errors = action.payload?.errors || [];
      state.products = [];
      state.isError = true;
    });
  },
});

export const { resetChatData } = addChatSlice?.actions;

export default addChatSlice?.reducer;
