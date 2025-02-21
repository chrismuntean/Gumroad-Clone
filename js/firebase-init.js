// firebase-init.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-analytics.js";

const firebaseConfig = {
  apiKey: "AIzaSyD5Gya8SoMKIPASbDyZrq4nkcp6zEglSGU",
  authDomain: "event-photography-16748.firebaseapp.com",
  projectId: "event-photography-16748",
  storageBucket: "event-photography-16748.firebasestorage.app",
  messagingSenderId: "287367672180",
  appId: "1:287367672180:web:26b13f923f1f09072ebc21",
  measurementId: "G-7W0Q2EMZ58"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { app };
