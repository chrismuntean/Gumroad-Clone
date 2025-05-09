// auth-session.js
import { app } from "./firebase-init.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";

const auth = getAuth(app);
const db = getFirestore(app);

onAuthStateChanged(auth, async (user) => {
  const authLinks = document.getElementById("auth-links");
  if (!authLinks) return; // Exit if nav isn't loaded yet

  if (user) {
    // Create or verify user document in "users" collection
    try {
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (!userDocSnap.exists()) {
        await setDoc(userDocRef, { purchases: [] });
        console.log(`User document created for UID: ${user.uid}`);
      } else {
        console.log(`User document already exists for UID: ${user.uid}`);
      }
    } catch (error) {
      console.error("Error creating/updating user document:", error);
    }

    // Use user's photoURL if available, otherwise use a fallback image
    const photoURL = user.photoURL || "/assets/img-static/blank-pfp.png";
    authLinks.innerHTML = `
      <div class="dropdown">
        <a class="nav-link dropdown-toggle p-0" href="#" id="userDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
          <img src="${photoURL}" alt="User image" class="rounded-circle" style="width:40px; height:40px;">
        </a>
        <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
          <li><a class="dropdown-item" href="/my-purchases">My Purchases</a></li>
          <li><hr class="dropdown-divider"></li>
          <li><a class="dropdown-item" href="#" id="logout-btn">Logout</a></li>
        </ul>
      </div>
    `;

    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", (e) => {
        e.preventDefault();
        signOut(auth)
          .then(() => {
            console.log("User signed out successfully.");
            // Redirect to the /login page after logout
            window.location.href = "/login";
          })
          .catch((error) => {
            console.error("Error signing out:", error);
          });
      });
    }
  } else {
    // Display default login/signup buttons when no user is logged in
    authLinks.innerHTML = `
      <a class="btn btn-outline-light py-2 me-3" href="/login">Login</a>
      <a class="btn btn-primary py-2" href="/signup">Sign Up</a>
    `;
  }
});