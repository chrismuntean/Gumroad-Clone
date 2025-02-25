// checkout-success.js
import { app } from "/js/firebase-init.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";
import { getFirestore, doc, setDoc, arrayUnion } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";

const auth = getAuth(app);
const db = getFirestore(app);

window.addEventListener("DOMContentLoaded", () => {
    // Retrieve the album ID from the URL query parameter (from Square checkout success)
    const params = new URLSearchParams(window.location.search);
    const albumId = params.get("album");

    if (!albumId) {
        alert("Album ID missing in URL.");
        window.location.href = "/my-purchases";
        return;
    }

    // Wait for the user auth state to be determined
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            try {
                // Use setDoc with merge:true to create or update the user's document,
                // and arrayUnion to add the albumId only if it doesn't exist already.
                await setDoc(
                    doc(db, "users", user.uid),
                    { purchases: arrayUnion(albumId) },
                    { merge: true }
                );
                console.log("Purchase logged successfully for album:", albumId);
            } catch (error) {
                alert("Error logging purchase:", error);
            }
        } else {
            window.location.href = "/login";
        }
        // Redirect to /my-purchases after processing
        window.location.href = "/my-purchases";
    });
});