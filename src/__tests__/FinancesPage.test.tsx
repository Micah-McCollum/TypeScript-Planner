// src/__tests__/FinancesPage.test.tsx
import { vi } from "vitest";

// Test for Finance logic builds out the stub in a similar way, to be able to test
// back-end logic modularly
vi.mock("firebase/app", () => ({ initializeApp: () => ({}) }));
vi.mock("firebase/firestore", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    getFirestore: () => ({}),
    query:      () => ({}),
    where:      () => ({}),
    getDocs:    async () => ({ docs: [] }),
    addDoc:     vi.fn(),
    updateDoc:  vi.fn(),
    deleteDoc:  vi.fn(),
    doc:        () => ({}),
  };
});
vi.mock("@utils/firestore", () => ({ financesCollection: {} }));

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import FinancesPage from "../pages/FinancesPage";
import { AuthContext } from "@contexts/AuthContext";

const fakeCtx = {
  user: { uid: "IDX", email: "a@b.com" },
  loading: false,
} as any;

test("Add button disabled until amount & type", () => {
  render(
    <AuthContext.Provider value={fakeCtx}>
      <FinancesPage />
    </AuthContext.Provider>
  );
  const btn = screen.getByRole("button", { name: /add/i });
  expect(btn).toBeDisabled();

  fireEvent.change(screen.getByLabelText(/amount/i), { target: { value: "50" } });
  expect(btn).toBeDisabled();

  fireEvent.change(screen.getByLabelText(/type/i), { target: { value: "Income" } });
  expect(btn).toBeEnabled();
});