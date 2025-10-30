import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  jobs: [],
  loading: false,
  error: null,
};

const jobSlice = createSlice({
  name: "jobs",
  initialState,
  reducers: {
    fetchJobsStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchJobsSuccess(state, action) {
      state.loading = false;
      state.jobs = action.payload;
      state.error = null;
    },
    fetchJobsFailure(state, action) {
      state.loading = false;
      state.error = action.payload || "Failed to fetch jobs.";
    },

    addJobStart(state) {
      state.loading = true;
      state.error = null;
    },
    addJobSuccess(state, action) {
      state.loading = false;
      state.jobs.unshift(action.payload); // add job to top
      state.error = null;
    },
    addJobFailure(state, action) {
      state.loading = false;
      state.error = action.payload || "Failed to add job.";
    },

    updateJobStart(state) {
      state.loading = true;
      state.error = null;
    },
    updateJobSuccess(state, action) {
      state.loading = false;
      const idx = state.jobs.findIndex(job => job._id === action.payload._id);
      if (idx !== -1) state.jobs[idx] = action.payload;
      state.error = null;
    },
    updateJobFailure(state, action) {
      state.loading = false;
      state.error = action.payload || "Failed to update job.";
    },

    deleteJobStart(state) {
      state.loading = true;
      state.error = null;
    },
    deleteJobSuccess(state, action) {
      state.loading = false;
      state.jobs = state.jobs.filter(job => job._id !== action.payload);
      state.error = null;
    },
    deleteJobFailure(state, action) {
      state.loading = false;
      state.error = action.payload || "Failed to delete job.";
    },
  }
});

export const {
  fetchJobsStart, fetchJobsSuccess, fetchJobsFailure,
  addJobStart, addJobSuccess, addJobFailure,
  updateJobStart, updateJobSuccess, updateJobFailure,
  deleteJobStart, deleteJobSuccess, deleteJobFailure
} = jobSlice.actions;

export default jobSlice.reducer;
