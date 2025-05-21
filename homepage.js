import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import { getFirestore, getDoc, doc } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyA_IiT77VIzL8Rxz7V7_gxMVdZ3xIq40PY",
    authDomain: "otplogin-f1e6f.firebaseapp.com",
    projectId: "otplogin-f1e6f",
    storageBucket: "otplogin-f1e6f.firebasestorage.app",
    messagingSenderId: "1071262798826",
    appId: "1:1071262798826:web:87ba917c2d4e420d2a1893"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth();
const db = getFirestore();

onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in, user data will be available in the 'user' object.
        // We can directly use user.uid to fetch data.
        const docRef = doc(db, "users", user.uid);
        getDoc(docRef)
            .then((docSnap) => {
                if (docSnap.exists()) {
                    const userData = docSnap.data();
                    document.getElementById('loggedUserFName').innerText = userData.firstName || '';
                    document.getElementById('loggedUserEmail').innerText = userData.email || '';
                    document.getElementById('loggedUserLName').innerText = userData.lastName || '';
                    // You might want to store the userId in localStorage upon successful sign-in
                    // in your firebaseauth.js file, if you need it elsewhere.
                    // However, 'user.uid' is the most reliable way to identify the logged-in user.
                } else {
                    console.log("No document found matching user ID:", user.uid);
                }
            })
            .catch((error) => {
                console.error("Error getting document:", error);
            });
    } else {
        // User is signed out
        console.log("User is signed out");
        window.location.href = 'index.html';
    }
});

const logoutButton = document.getElementById('logout');

if (logoutButton) {
    logoutButton.addEventListener('click', () => {
        signOut(auth)
            .then(() => {
                console.log('User signed out');
                window.location.href = 'index.html';
            })
            .catch((error) => {
                console.error('Error Signing out:', error);
            });
    });
} else {
    console.error("Logout button element not found!");
}