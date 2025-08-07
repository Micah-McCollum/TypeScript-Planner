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
  user: { uid: "TestUser", email: "TestEmail@Test.com" },
  loading: false,
} as never;

test("Add button disabled until amount & type", async () => {
  render(
    <AuthContext.Provider value={fakeCtx}>
      <FinancesPage />
    </AuthContext.Provider>
  );
  const addBtn = screen.getByRole("button", { name: /add/i });
  expect(addBtn).toBeDisabled();

  // fill amount attempt while button should be disable
  fireEvent.change(screen.getByLabelText(/amount/i), {
    target: { value: "50" },
  });
  expect(addBtn).toBeDisabled();
  // Simulates interacting with combobox to emulate actual use
  const combo = screen.getByRole("combobox");

  fireEvent.mouseDown(combo);

  const expense = await screen.findByText("Expense");
  fireEvent.click(expense);

  // Add should be enabled after being selected here
  expect(addBtn).toBeEnabled();
});