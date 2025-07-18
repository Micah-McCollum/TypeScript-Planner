import { initializeApp } from "firebase/app";
import { getFirestore} from "firebase/firestore";

//Firebase configuration, documentation said okay to have API key here without env variable but can fix if needed
const firebaseConfig = {
    apiKey: "AIzaSyC5_zAy0htQQg3uiY5fcaYLm9iWF3XA8oQ",
    authDomain: "sp25-hotel.firebaseapp.com",
    projectId: "sp25-hotel",
    storageBucket: "sp25-hotel.firebasestorage.app",
    messagingSenderId: "925290704698",
    appId: "1:925290704698:web:f643e1e00e977bfe21aa03"
  };

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };