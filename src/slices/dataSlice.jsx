import { createSlice } from '@reduxjs/toolkit';

const dataSlice = createSlice({
  name: 'data',
  initialState: {
    data: [],
    status: 'idle',
    error: null,
  },
  reducers: {
    fetchDataStart: (state) => {
      state.status = 'loading';
    },
    fetchDataSuccess: (state, action) => {
      state.data = action.payload;
      state.status = 'succeeded';
    },
    fetchDataFailure: (state, action) => {
      state.status = 'failed';
      state.error = action.payload;
    },
  },
});

export const { fetchDataStart, fetchDataSuccess, fetchDataFailure } = dataSlice.actions;

export default dataSlice.reducer;
