
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

//  Primero declaramos la configuración
const firebaseConfig = {
  apiKey: "AIzaSyDegURlhl4afojDlWQqm2b3veKpsVxUL1E",
  authDomain: "web-jesus-aguilar.firebaseapp.com",
  projectId: "web-jesus-aguilar",
  storageBucket: "web-jesus-aguilar.appspot.com", 
  messagingSenderId: "1050521727259",
  appId: "1:1050521727259:web:8568bd5a8bf9344feee3be"
};

//  Luego inicializamos Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Finalmente exportamos Firestore
export const db = getFirestore(app);
export { auth };
