import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";

import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";

window.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("purchase-card-container");
    const rowContainer = document.getElementById("content-row");
    const headerEl = document.getElementById("header");
    const loader = document.getElementById("album-loader");

    onAuthStateChanged(auth, async (user) => {
        if (!user) {
            window.location.href = "/login";
            return;
        }

        loader.style.display = "block";
        rowContainer.innerHTML = "";

        try {
            const userDocRef = doc(db, "users", user.uid);
            const userDocSnap = await getDoc(userDocRef);

            if (!userDocSnap.exists()) {
                console.warn("User doc not found");
                headerEl.textContent = "No purchases yet";
                return;
            }

            const purchases = userDocSnap.data().purchases;
            if (!Array.isArray(purchases) || purchases.length === 0) {
                console.warn("No purchases found in user doc");
                headerEl.textContent = "No purchases yet";
                return;
            }

            headerEl.textContent = "Your purchases";
            let albumsArray = [];

            for (const albumId of purchases) {
                try {
                    const albumDocRef = doc(db, "albums", albumId);
                    const albumDocSnap = await getDoc(albumDocRef);
                    if (albumDocSnap.exists()) {
                        const album = albumDocSnap.data();
                        album.id = albumId;
                        albumsArray.push(album);
                    } else {
                        console.warn(`Album with ID ${albumId} not found`);
                    }
                } catch (albumError) {
                    console.error(`Error fetching album ${albumId}:`, albumError);
                }
            }

            if (albumsArray.length === 0) {
                console.warn("No album docs matched the purchases");
                headerEl.textContent = "No purchases yet";
                return;
            }

            albumsArray.sort((a, b) => {
                const cleanDate = (str) =>
                    new Date(str.replace(/(\d+)(st|nd|rd|th)/, "$1")).getTime();
                return cleanDate(b.date) - cleanDate(a.date);
            });

            let cardsHtml = "";
            albumsArray.forEach((album) => {
                cardsHtml += `
                    <div class="card col m-3 px-0" style="width: 18rem;">
                        <img src="${album.coverImage}" class="card-img-top" alt="${album.title}">
                        <div class="card-body">
                            <h5 class="card-title">${album.title}</h5>
                            <p class="card-text text-muted">${album.date}</p>
                            <a href="${album.lightroomLink}" target="_blank" class="btn btn-primary">View album</a>
                        </div>
                    </div>
                `;
            });

            rowContainer.innerHTML = cardsHtml;
        } catch (error) {
            console.error("Error loading purchases:", error);
            container.innerHTML = `<p>Error loading purchases: ${error.message}</p>`;
        } finally {
            loader.style.display = "none";
        }
    });
});