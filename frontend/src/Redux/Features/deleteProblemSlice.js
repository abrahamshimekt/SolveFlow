import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { axiosErrorHandler, getCookie } from "../../utils/helper";
import setAuthToken from "../../utils/setAuthToken";
import axios from "axios";
import { toastSuccess } from "../../utils/toast";
import { BASE_URL } from "../../Config";

const initialState = {
    isLoading: false,
    isError: false,
    errors: [],
    isSuccess: false,
    message: "",
  
};

export const deleteProblem = createAsyncThunk("chat/delete-problem",
    async ({ id, onSuccess }, { rejectWithValue }) => {
        try {
            let token = getCookie('token');
            setAuthToken(token);
            const response = await axios.delete(`${BASE_URL}/api/user/problems/${id}`);
            onSuccess && onSuccess();
            toastSuccess(response?.data?.message);

            return response?.data;

        } catch (error) {
            axiosErrorHandler(error);

            return rejectWithValue(error?.response?.data);
        }
    }
);

const deleteProblemSlice = createSlice({
    name: "delete problem slice",
    initialState: initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(deleteProblem.pending, (state) => {
            state.isLoading = true;
            state.isSuccess = false;
            state.isError = false;
            state.errors = [];
        });

        builder.addCase(deleteProblem.fulfilled, (state, action) => {
            state.isLoading = false;
            state.isSuccess = action.payload.success;
            state.isError = !action.payload.success;
            state.message = action.payload.message;
        });

        builder.addCase(deleteProblem.rejected, (state, action) => {
            state.isLoading = false;
            state.isSuccess = false;
            state.isError = true;
        });
    }
});

export default deleteProblemSlice.reducer;
