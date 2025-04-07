import { defineMock } from "./base";

export default defineMock([
  {
    url: "auth/login",
    method: ["POST"],
    body: {
      errors: [],
      result: true,
      msg: "Success",
      token: {
        expiry_time: "2025-05-07T02:04:54.03315Z",
        token:
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyIiwianRpIjoiMWYyMjRiMjItZDQ0MC00YWNkLTgyNzYtOGU1NzJjZTg1NzZjIiwicm9sZSI6IjEiLCJuYmYiOjE3NDM5OTE0OTQsImV4cCI6MTc0NjU4MzQ5NCwiaWF0IjoxNzQzOTkxNDk0LCJpc3MiOiJodHRwOi8vNjAuMjUxLjIzMC4xMTA6ODA4OCJ9.PNo7oKf6jIGP4SAq8fgz-gNVDV3hjYoD50J8hu8eL_E",
      },
    },
  },
]);
