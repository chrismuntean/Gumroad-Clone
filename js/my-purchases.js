// my-purchases.js
import { app } from "/js/firebase-init.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";

const auth = getAuth(app);
const db = getFirestore(app);

window.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("purchase-card-container");
    const rowContainer = document.getElementById("content-row");
    const headerEl = document.getElementById("header");

    onAuthStateChanged(auth, async (user) => {
        if (!user) {
            // Redirect to login if no user is logged in.
            window.location.href = "/login";
            return;
        }

        try {
            // Retrieve the user's document from the "users" collection.
            const userDocRef = doc(db, "users", user.uid);
            const userDocSnap = await getDoc(userDocRef);

            // If no document or empty purchases, display "No purchases yet"
            if (!userDocSnap.exists() || !userDocSnap.data().purchases || userDocSnap.data().purchases.length === 0) {
                headerEl.textContent = "No purchases yet";
                return;
            }

            // If there are purchases, update header and build album cards.
            headerEl.textContent = "Your purchases";
            const purchases = userDocSnap.data().purchases; // Array of album IDs
            let cardsHtml = "";

            for (const albumId of purchases) {
                const albumDocRef = doc(db, "albums", albumId);
                const albumDocSnap = await getDoc(albumDocRef);
                if (albumDocSnap.exists()) {
                    const album = albumDocSnap.data();
                    cardsHtml += `
                            <div class="card col m-3 px-0" style="width: 18rem;">
                                <img src="${album.coverImage || 'https://via.placeholder.com/286x180'}" class="card-img-top" alt="${album.title}">
                                <div class="card-body">
                                    <h5 class="card-title">${album.title || "Untitled Album"}</h5>
                                    <p class="card-text text-muted">${album.date || ""}</p>
                                    <a href="${album.lightroomLink}" class="btn btn-primary">View album</a>
                                </div>
                            </div>
                        `;
                } else {
                    console.warn(`Album with ID ${albumId} not found.`);
                }
            }
            rowContainer.innerHTML = cardsHtml;
        } catch (error) {
            console.error("Error loading purchases:", error);
            container.innerHTML = `<p>Error loading purchases: ${error.message}</p>`;
        }
    });
});