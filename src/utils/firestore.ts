/* eslint-disable @typescript-eslint/no-explicit-any */
// firestore.ts - Utility functions for Firestore
import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";
import { db } from "./firebase";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";

// Firebase authentication
const auth = getAuth();

// Firestore collections definitions
export const financesCollection = collection(db, "finances");
export const notesCollection = collection(db, "notes");
export const calendarCollection = collection(db, "calendar");
export const notificationsCollection = collection(db, "notifications");

// fetchDocument - returns a single doc by the docId
// @param {string} collectionName - Chooses name of collection to query
// @param {string} docId - The ID of the chosen document to fetch
export async function fetchDocument(collectionName: string, docId: string) {
    if (!db) throw new Error("Firestore not initialized");

    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
        throw new Error(`Document with ID ${docId} not found in collection ${collectionName}`);
    }

    return { id: docSnap.id, ...docSnap.data() };
}

// fetchAllDocuments - returns all documents in a selected collection
// @param {string} collectionName - Selects the collection to return docs from
export async function fetchAllDocuments(collectionName: string) {
    if (!db) throw new Error("Firestore not initialized");
  return (await getDocs(collection(db, collectionName))).docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
}

// checkUserExists - returns a user matching a given email if found in db, or false if not found
// @param {string} email - email checked to see if user is associated with already
export const checkUserExists = async (email:string): Promise<boolean> => {
  try {
    const userRef = collection(db,"users");
    const q = query(userRef, where("email", "==", email));
    const qSnapshot = await getDocs(q);

    return !qSnapshot.empty;
    } catch (error) {
      console.error("checkUserExists error, ", error);
      return false;
    }
  };
  
// registerUser - Adds a user to db for firestore authentication if email doesn't match one in db
// @param {string} email - email associated with user profile added
// @param {string} password - password associated with user profile added
export const registerUser = async (email:string, password:string) => {
  try{
    const userCredenentials = await createUserWithEmailAndPassword(auth, email, password);
    console.log("New user registered: ", userCredenentials.user);
    return userCredenentials.user;
  } catch (error: any) {
    console.error("Register with E/P error: ", error.message);
    throw new Error(error.message);
  }
};

// loginUser - Checks against stored credentials to log a User into their account
// @param {string} email - email associated with user profile added
// @param {string} password - password associated with user profile added
export const loginUser = async (email:string, password:string) => {
  try{
    const userCredenentials = await signInWithEmailAndPassword(auth, email, password);
    console.log("User logged in: ", userCredenentials.user);
    return userCredenentials.user;
  } catch (error: any) {
    console.error("User login error: ", error.message);
    throw new Error(error.message);  
  }
}

