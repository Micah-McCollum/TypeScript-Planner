import { initializeApp } from "firebase/app";
import { getFirestore} from "firebase/firestore";

// Setup for the Firebase connection and DB stored in Env Variable not commmitted
const firebaseConfig = {
  apiKey:         import.meta.env.VITE_FIREBASE_API_KEY as string,
  authDomain:     import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string,
  projectId:      import.meta.env.VITE_FIREBASE_PROJECT_ID as string,
  storageBucket:  import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string,
  appId:          import.meta.env.VITE_FIREBASE_APP_ID as string,
};

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };