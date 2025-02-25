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
                rowContainer.innerHTML = "";
                return;
            }

            headerEl.textContent = "Your purchases";
            const purchases = userDocSnap.data().purchases; // Array of album IDs

            // Build an array of album objects along with their ID.
            let albumsArray = [];
            for (const albumId of purchases) {
                const albumDocRef = doc(db, "albums", albumId);
                const albumDocSnap = await getDoc(albumDocRef);
                if (albumDocSnap.exists()) {
                    const album = albumDocSnap.data();
                    album.id = albumId; // store albumId for linking if needed
                    albumsArray.push(album);
                } else {
                    console.warn(`Album with ID ${albumId} not found.`);
                }
            }

            // Sort albums by createdAt (newest first). If createdAt is missing, treat as 0.
            albumsArray.sort((a, b) => {
                const aTime = a.createdAt ? a.createdAt.toMillis() : 0;
                const bTime = b.createdAt ? b.createdAt.toMillis() : 0;
                return bTime - aTime;
            });

            // Build HTML for each album card.
            let cardsHtml = "";
            albumsArray.forEach((album) => {
                cardsHtml += `
                        <div class="card col m-3 px-0" style="width: 18rem;">
                            <img src="${album.coverImage || '/assets/img-static/camera-lens.png'}" class="card-img-top" alt="${album.title}">
                            <div class="card-body">
                                <h5 class="card-title">${album.title || "Untitled Album"}</h5>
                                <p class="card-text text-muted">${album.date || ""}</p>
                                <a href="${album.lightroomLink}" target="_blank" class="btn btn-primary">View album</a>
                            </div>
                        </div>
                        `;
            });

            rowContainer.innerHTML = cardsHtml;
        } catch (error) {
            console.error("Error loading purchases:", error);
            container.innerHTML = `<p>Error loading purchases: ${error.message}</p>`;
        }
    });
});