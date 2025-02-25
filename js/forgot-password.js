// forgot-password.js
import { app } from "./firebase-init.js";
import { getAuth, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";

const auth = getAuth(app);

// Redirect the user to the root page if they're logged
// Wait for the window to load and a short delay to let auth initialize.
window.addEventListener("load", () => {
  setTimeout(() => {
    if (auth.currentUser) {
      window.location.href = "/";
    }
  }, 500); // 500ms delay; adjust as needed
  
  // Optionally, also attach an onAuthStateChanged in case the user logs in later.
  onAuthStateChanged(auth, (user) => {
    if (user) {
      window.location.href = "/";
    }
  });
});

const forgotPasswordForm = document.getElementById("forgot-password-form");
const alertContainer = document.getElementById("alert-container");

/**
 * Utility function to display a Bootstrap alert.
 * @param {string} type - One of "success", "danger", "warning", etc.
 * @param {string} message - The message to display.
 */
function showAlert(type, message) {
  alertContainer.innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show" role="alert">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
  `;
}

forgotPasswordForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value.trim();

  try {
    await sendPasswordResetEmail(auth, email);
    showAlert("success", "Password reset email sent. Please check your inbox.");
  } catch (error) {
    console.error("Error sending password reset email:", error.message);
    showAlert("danger", error.message);
  }
});