// login.js
import { app } from "./firebase-init.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";

const auth = getAuth(app);

// Redirect the user to the root page if they're logged
// Wait for the window to load and a short delay to let auth initialize.
window.addEventListener("load", () => {
  setTimeout(() => {
    if (auth.currentUser) {
      window.location.href = "/";
    }
  }, 500); // 500ms delay
  
  onAuthStateChanged(auth, (user) => {
    if (user) {
      window.location.href = "/";
    }
  });
});

const loginForm = document.getElementById("login-form");
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

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    // Immediately redirect to the root page
    window.location.href = "/";
  } catch (error) {
    console.error("Login error:", error.message);
    showAlert("danger", error.message);
  }
});

googleLoginBtn.addEventListener("click", async (e) => {
  e.preventDefault();
  try {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
    // Immediately redirect to the root page
    window.location.href = "/";
  } catch (error) {
    console.error("Google login error:", error.message);
    showAlert("danger", error.message);
  }
});