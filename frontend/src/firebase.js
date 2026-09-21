import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  projectId: "sys-ems-app-998",
  appId: "1:753204285385:web:7b1595b29234b508b6e218",
  storageBucket: "sys-ems-app-998.firebasestorage.app",
  apiKey: "AIzaSyC3wbLRVHQAx2D4Lwb3c67ZgpfewnVyWl0",
  authDomain: "sys-ems-app-998.firebaseapp.com",
  messagingSenderId: "753204285385"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
