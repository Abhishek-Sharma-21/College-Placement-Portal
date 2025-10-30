import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  profile: null, // Will hold the student's profile object
  loading: false,
  error: null,
  isProfileComplete: false, // Track if profile has been completed
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
      state.profile = action.payload;
      // Profile is complete if it exists and has required fields
      state.isProfileComplete = !!(
        action.payload?.branch && action.payload?.user
      );
      state.error = null;
    },
    fetchProfileFailure: (state, action) => {
      state.loading = false;
      state.profile = null;
      state.isProfileComplete = false;
      state.error = action.payload || "Failed to fetch profile";
    },

    // --- Reducers for UPDATING a profile ---
    updateProfileStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    updateProfileSuccess: (state, action) => {
      state.loading = false;
      state.profile = action.payload; // Updated profile object from backend
      // Mark profile as complete when successfully updated
      state.isProfileComplete = !!(
        action.payload?.branch && action.payload?.user
      );
      state.error = null;
    },
    updateProfileFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload || "Failed to update profile";
    },

    // --- Reducer to clear errors ---
    clearProfileError: (state) => {
      state.error = null;
    },

    // --- Reducer to clear profile on logout ---
    clearProfile: (state) => {
      state.profile = null;
      state.loading = false;
      state.error = null;
      state.isProfileComplete = false;
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
  clearProfileError,
  clearProfile,
} = studentProfileSlice.actions;

export default studentProfileSlice.reducer;
