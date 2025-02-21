// signup.js
import { app } from "./firebase-init.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";

const auth = getAuth(app);

const signupForm = document.getElementById("signup-form");
const googleLoginBtn = document.getElementById("google-login");
const alertContainer = document.getElementById("alert-container");

function showAlert(type, message) {
  alertContainer.innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show" role="alert">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
  `;
}

signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirm-password").value;

  if (password !== confirmPassword) {
    showAlert("warning", "Passwords do not match.");
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log("Signed up:", userCredential.user);
    showAlert("success", "Account created successfully!");
    // Optionally, redirect: window.location.href = "/dashboard";
  } catch (error) {
    console.error("Sign up error:", error.message);
    showAlert("danger", error.message);
  }
});

googleLoginBtn.addEventListener("click", async (e) => {
  e.preventDefault();
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    console.log("Signed up with Google:", result.user);
    showAlert("success", "Signed up with Google successfully!");
  } catch (error) {
    console.error("Google sign up error:", error.message);
    showAlert("danger", error.message);
  }
});
