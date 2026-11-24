
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getHotels } from "../services/hotelService";

// Fetch hotels from backend
export const fetchHotels = createAsyncThunk(
    "hotels/fetchHotels",
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await getHotels(params);
            return response;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to fetch hotels"
            );
        }
    }
);

const hotelSlice = createSlice({
    name: "hotels",

    initialState: {
        hotels: [],
        loading: false,
        error: null,
        pagination: null,
    },

    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },

    extraReducers: (builder) => {
        builder
            .addCase(fetchHotels.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchHotels.fulfilled, (state, action) => {
    state.loading = false;
    state.hotels = action.payload.data;
    state.pagination = action.payload.pagination;
})
            .addCase(fetchHotels.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearError } = hotelSlice.actions;

export default hotelSlice.reducer;