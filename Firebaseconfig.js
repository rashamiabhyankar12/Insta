import { getApp, getApps, initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";

// Import initializeAuth and getReactNativePersistence
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getReactNativePersistence, initializeAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCF8Dp3d8fQJ5xjy5lrI-2oNBUWo5HoUMw",
  authDomain: "fir-grocery-f7ec0.firebaseapp.com",
  projectId: "fir-grocery-f7ec0",
  storageBucket: "fir-grocery-f7ec0.firebasestorage.app",
  messagingSenderId: "467130491154",
  appId: "1:467130491154:web:74bb4f2fe704d3272613cb",
  measurementId: "G-SXJSTH8ST2",
  databaseURL: "https://fir-grocery-f7ec0-default-rtdb.asia-southeast1.firebasedatabase.app/"
};

// Prevent re-initialization on hot-reload
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth specifically for React Native persistence
const authentication = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

const database = getFirestore(app);
const db = getDatabase(app);

export { authentication, database, db };
