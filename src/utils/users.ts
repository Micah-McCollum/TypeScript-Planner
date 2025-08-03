import { doc, setDoc, serverTimestamp, collection } from "firebase/firestore";
import { db } from "./firebase";
import type { User } from "firebase/auth";

// Setup class for User creation and storage in Firebase
export const usersCollection = collection(db, "users");

export async function createUserProfile(user: User) {
  const userDoc = doc(usersCollection, user.uid);
  await setDoc(userDoc, {
    email: user.email,
    createdAt: serverTimestamp(),
  });
}