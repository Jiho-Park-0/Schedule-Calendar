import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAWsFLbP2V2_NFEjb2C2Om_vjPDm4XLaco",
  authDomain: "schedule-ea1f9.firebaseapp.com",
  projectId: "schedule-ea1f9",
  storageBucket: "schedule-ea1f9.appspot.com",
  messagingSenderId: "388553642275",
  appId: "1:388553642275:web:67caa31fbeb6379724fc96",
};

const app = initializeApp(firebaseConfig);
export const scheduleCalendarFirestore = getFirestore(app);
