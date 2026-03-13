
// Firebase configuration (provided by user)
const firebaseConfig = {
  apiKey: "AIzaSyCSrMXo06W5WT3QJApK09H9-EEKZoWVrEo",
  authDomain: "disease-prediction-analysis.firebaseapp.com",
  projectId: "disease-prediction-analysis",
  storageBucket: "disease-prediction-analysis.firebasestorage.app",
  messagingSenderId: "155223020246",
  appId: "1:155223020246:web:4dad390171c263aceeaf77",
  measurementId: "G-4MBQV19FJ1"
};

// We will use the Firebase v9+ modular SDK (via CDN)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Export for use in main logic
export { 
    auth, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged 
};
