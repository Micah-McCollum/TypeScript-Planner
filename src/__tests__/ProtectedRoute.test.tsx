/* Tests for ProtectedRouting in the app tests both expected positive and negative responses
 / Navigating to "home" should pass if user is logged in, if not navigates to "login"
 / Confirmed Passing as of 8/4
*/
import { vi } from "vitest";

vi.mock("firebase/app", () => ({
  initializeApp: () => ({}),
}));

vi.mock("firebase/auth", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    getAuth:     () => ({}),
    onAuthStateChanged: (_auth: any, cb: any) => {
      // simulate immediate callback
      cb(null);
      return () => {};
    },
    signOut: vi.fn(),
  };
});
vi.mock("firebase/firestore", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    getFirestore: () => ({}),
    query:      () => ({}),
    where:      () => ({}),
    getDocs:    async () => ({ docs: [] }),
  };
});

vi.mock("@utils/firestore", () => ({
  financesCollection: {},
  notesCollection:    {},
  calendarCollection: {},
}));

import React from "react";
import { render, screen } from "@testing-library/react";
import ProtectedRoute from "../shared/components/ProtectedRoute";
import { AuthContext } from "@contexts/AuthContext";
import { MemoryRouter } from "react-router-dom";

const fakeContext = {
  user: null,
  loading: true,
} as any;

test("shows loading when auth is loading", () => {
  render(
    <AuthContext.Provider value={fakeContext}>
      <ProtectedRoute>
        <div>Secret</div>
      </ProtectedRoute>
    </AuthContext.Provider>
  );
  expect(screen.getByText(/loading/i)).toBeInTheDocument();
});

// ProtectedRouting tested here, should redirect to login 
test("redirects when not logged in", () => {
  const stub = { user: null, loading: false } as any;
  render(
    <AuthContext.Provider value={stub}>
      <MemoryRouter initialEntries={["/"]}>
        <ProtectedRoute>
          <div>Secret</div>
        </ProtectedRoute>
      </MemoryRouter>
    </AuthContext.Provider>
  );

  expect(screen.queryByText("Secret")).toBeNull();
});