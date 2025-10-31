// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey:import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "smartfood-461fb.firebaseapp.com",
  projectId: "smartfood-461fb",
  storageBucket: "smartfood-461fb.firebasestorage.app",
  messagingSenderId: "101021272901",
  appId: "1:101021272901:web:54ebe925837059a5a34c2c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth=getAuth(app)
export {app,auth}