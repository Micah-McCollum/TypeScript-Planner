// src/__tests__/NotesPage.test.tsx
import { vi } from "vitest";

/* Tests for the NotesPage's logic, and specifically for the use of the encryption  
* 
*/
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
vi.mock("@utils/firestore", () => ({ notesCollection: {} }));

// Hook will return 'ready' as true immediately 
vi.mock("@shared/components/encrypt/client/useClientSideEncryption", () => ({
  useClientSideEncryption: () => ({
    ready: true,
    clientSideOnlyEncryptionEncrypt: vi.fn(async (s) => s),
    clientSideOnlyEncryptionDecrypt: vi.fn(async (s) => s),
  }),
}));

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import NotesPage from "../pages/NotesPage";
import { AuthContext } from "@contexts/AuthContext";

const fakeCtx = {
  user: { uid: "U1", email: "x@y.com" },
  loading: false,
} as any;

test("shows no notes message", async () => {
  render(
    <AuthContext.Provider value={fakeCtx}>
      <NotesPage />
    </AuthContext.Provider>
  );
  expect(screen.getByText(/loading notes/i)).toBeInTheDocument();
  await waitFor(() => {
    expect(screen.getByText(/no notes yet/i)).toBeInTheDocument();
  });
});