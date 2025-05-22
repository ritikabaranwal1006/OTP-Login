import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import {
    getFirestore,
    setDoc,
    doc
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js"


const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-app.firebaseapp.com",
  projectId: "your-app",
  storageBucket: "your-app.appspot.com",
  messagingSenderId: "xxxxxxxxxxx",
  appId: "1:xxxxxxxxxxxx:web:xxxxxxxxxxxxx"
};




// Initialize Firebase
const app = initializeApp(firebaseConfig);

function showMessage(message, divId) {
    var messageDiv = document.getElementById(divId);
    if (messageDiv) {
        messageDiv.style.display = "block";
        messageDiv.innerHTML = message;
        messageDiv.style.opacity = 1;
        setTimeout(function() {
            messageDiv.style.opacity = 0;
        }, 5000);
    } else {
        console.error(`Element with ID '${divId}' not found to display message.`);
    }
}

// Get references to the sign-in and sign-up containers
const signInContainer = document.getElementById('signIn');
const signUpContainer = document.getElementById('signup');

// Get references to the buttons that trigger the switch
const signInButton = document.getElementById('signInButton'); // Button in the signup form to go to sign in
const switchToSignUpButton = document.getElementById('switchToSignUp'); // Button in the sign-in form to go to sign up

if (switchToSignUpButton) {
    switchToSignUpButton.addEventListener('click', () => {
        if (signInContainer) {
            signInContainer.style.display = 'none';
        }
        if (signUpContainer) {
            signUpContainer.style.display = 'block';
        }
    });
} else {
    console.error("Button to switch to Sign Up not found in Sign In section.");
}

if (signInButton) {
    signInButton.addEventListener('click', () => {
        if (signUpContainer) {
            signUpContainer.style.display = 'none';
        }
        if (signInContainer) {
            signInContainer.style.display = 'block';
        }
    });
} else {
    console.error("Button to switch to Sign In not found in Sign Up section.");
}


const signUpSubmit = document.getElementById('submitSignUp');
if (signUpSubmit) {
    signUpSubmit.addEventListener('click', (event) => {
        event.preventDefault();
        const email = document.getElementById('rEmail').value;
        const password = document.getElementById('rPassword').value;
        const firstName = document.getElementById('fName').value;
        const lastName = document.getElementById('lName').value;

        const auth = getAuth();
        const db = getFirestore();

        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                const userData = {
                    email: email,
                    firstName: firstName,
                    lastName: lastName
                };
                showMessage('Account Created Successfully', 'signUpMessage');
                const docRef = doc(db, "users", user.uid);
                setDoc(docRef, userData)
                    .then(() => {
                        window.location.href = 'index.html';
                    })
                    .catch((error) => {
                        console.error("error writing document", error);
                        showMessage('Unable to save user data.', 'signUpMessage');
                    });
            })
            .catch((error) => {
                const errorCode = error.code;
                if (errorCode === 'auth/email-already-in-use') {
                    showMessage('Email Address Already Exists !!!', 'signUpMessage');
                } else {
                    showMessage('Unable to create User: ' + error.message, 'signUpMessage');
                    console.error("Firebase Sign-Up Error:", error);
                }
            });
    });
} else {
    console.error("Element with ID 'submitSignUp' (for submission) not found!");
}

const signInSubmit = document.getElementById('submitSignIn');
if (signInSubmit) {
    signInSubmit.addEventListener('click', (event) => {
        event.preventDefault();
        const emailInput = document.getElementById('email');
        const password = document.getElementById('password').value;
        const email = emailInput.value.trim(); // Trim whitespace

        // Basic email validation regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showMessage('Please enter a valid email address.', 'signInMessage');
            return; // Stop the sign-in attempt
        }

        const auth = getAuth();

        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const user = userCredential.user;

                // OTP generation (Consider more secure methods in production)
                const otp = Math.floor(100000 + Math.random() * 900000);
                localStorage.setItem("otp", otp);
                localStorage.setItem("tempUserId", user.uid);

                emailjs.send("service_knolh2i", "template_00716bl", {
                        to_email: email,
                        otp: otp,
                    }, "P9zv1rRbBHx55SJie")
                    .then(() => {
                        window.location.href = "otp.html";
                    })
                    .catch((error) => {
                        showMessage('Failed to send OTP. Please try again.', 'signInMessage');
                        console.error("EmailJS Error:", error);
                    });
            })
            .catch((error) => {
                const errorCode = error.code;
                if (errorCode === 'auth/invalid-credential') {
                    showMessage('Incorrect Email or Password', 'signInMessage');
                } else if (errorCode === 'auth/user-not-found') {
                    showMessage('Account does not Exist', 'signInMessage');
                } else {
                    showMessage('Unable to Sign In: ' + error.message, 'signInMessage');
                    console.error("Firebase Sign-In Error:", error);
                }
            });
    });
} else {
    console.error("Element with ID 'submitSignIn' not found!");
}

if (window.location.pathname.includes('otp.html')) {
    document.addEventListener("DOMContentLoaded", () => {
        const otpForm = document.getElementById("otpForm");
        const otpInput = document.getElementById("otpInput");
        const messageDiv = document.getElementById("otpMessage");

        if (otpForm) {
            otpForm.addEventListener("submit", (event) => {
                event.preventDefault();
                const enteredOtp = otpInput.value;
                const storedOtp = localStorage.getItem("otp");

                if (enteredOtp === storedOtp) {
                    messageDiv.textContent = "OTP Verified Successfully!";
                    messageDiv.style.color = "green";

                    // Clear OTP from storage and redirect
                    localStorage.removeItem("otp");
                    const userId = localStorage.getItem("tempUserId");
                    localStorage.removeItem("tempUserId");

                    setTimeout(() => {
                        window.location.href = "homepage.html";
                    }, 2000);
                } else {
                    messageDiv.textContent = "Invalid OTP. Please try again.";
                    messageDiv.style.color = "red";
                }
            });
        } else {
            console.error("Element with ID 'otpForm' not found on otp.html!");
        }
    });
}
