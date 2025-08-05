/* The test-suite is built with mocked Firebase/Firestore, to test the HomePage(Smoketest)
 / before actual network calls are tested afterwards
*/
import { vi } from "vitest";

vi.mock("firebase/app", () => ({
  initializeApp: () => ({}),
}));

// Keep all the real Firestore helpers (collection, doc, etc.)
// Override the ones your HomePage uses (getFirestore, query, where, getDocs) with no-ops,
// Uses the actual custom exports so we don’t break collection(), doc(), etc.

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
  calendarCollection: {},
  notesCollection: {},
}));

import { render, screen } from "@testing-library/react";
import HomePage from "../pages/HomePage";
import { AuthContext } from "../contexts/AuthContext";

const fakeContext = {
  user:        { uid: "FAKE_UID", email: "test@example.com" },
  loading:     false,
  signUp:      vi.fn(),
  signIn:      vi.fn(),
  signOutUser: vi.fn(),
};

test("HomePage renders welcome text", () => {
  render(
    <AuthContext.Provider value={fakeContext as any}>
      <HomePage />
    </AuthContext.Provider>
  );
  expect(
    screen.getByText(/Welcome to TypeScript Planner/i)
  ).toBeInTheDocument();
});

test("HomePage shows logged-in email", () => {
  render(
    <AuthContext.Provider value={fakeContext as any}>
      <HomePage />
    </AuthContext.Provider>
  );
  expect(
    screen.getByText(/Logged in as test@example\.com/i)
  ).toBeInTheDocument();
});