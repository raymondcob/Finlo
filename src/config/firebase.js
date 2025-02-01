
import { initializeApp } from "firebase/app";
import { getAuth,setPersistence,browserSessionPersistence} from "firebase/auth";  
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
  
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "stackup-b75c4.firebaseapp.com",
  projectId: "stackup-b75c4",
  storageBucket: "stackup-b75c4.firebasestorage.app",
  messagingSenderId: "1049336404907",
  appId: "1:1049336404907:web:f4605a973e1eea352110ee",
  measurementId: "G-MKKHLC6342"
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);



setPersistence(auth, browserSessionPersistence).catch((error) => {
  console.error("Error setting persistence:", error);
});


export { auth,db };
