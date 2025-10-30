import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  profile: null, // Will hold the student's profile object
  loading: false,
  error: null,
};

const studentProfileSlice = createSlice({
  name: "studentProfile",
  initialState,
  reducers: {
    // --- Reducers for FETCHING a profile ---
    fetchProfileStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchProfileSuccess: (state, action) => {
      state.loading = false;
      state.profile = action.payload; // Payload = the profile object
      state.error = null;
    },
    fetchProfileFailure: (state, action) => {
      state.loading = false;
      state.profile = null;
      state.error = action.payload || "Failed to fetch profile";
    },

    // --- Reducers for UPDATING a profile ---
    updateProfileStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    updateProfileSuccess: (state, action) => {
      state.loading = false;
      state.profile = action.payload; // Payload = the *updated* profile object from backend
      state.error = null;
    },
    updateProfileFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload || "Failed to update profile";
    },

    // --- Reducer to clear profile on logout ---
    clearProfile: (state) => {
      state.profile = null;
      state.loading = false;
      state.error = null;
    },
  },
});

export const {
  fetchProfileStart,
  fetchProfileSuccess,
  fetchProfileFailure,
  updateProfileStart,
  updateProfileSuccess,
  updateProfileFailure,
  clearProfile,
} = studentProfileSlice.actions;

export default studentProfileSlice.reducer;
