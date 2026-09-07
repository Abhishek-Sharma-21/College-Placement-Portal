import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { logout } from "../slices/authSlice";

import API_URL from "../../lib/api";

const baseQuery = fetchBaseQuery({
  baseUrl: API_URL,
  credentials: "include",
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    // Attempt silent token refresh
    try {
      const refreshResult = await baseQuery(
        { url: "/auth/refresh", method: "POST" },
        api,
        extraOptions
      );

      if (refreshResult.data) {
        // Retry the original query
        result = await baseQuery(args, api, extraOptions);
      } else {
        // Refresh token expired or invalid
        api.dispatch(logout());
      }
    } catch (err) {
      api.dispatch(logout());
    }
  }
  return result;
};

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Jobs", "Applications", "Announcements", "Profile"],
  endpoints: () => ({}),
});
export default apiSlice;
