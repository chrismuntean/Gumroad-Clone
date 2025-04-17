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

        loader.style.display = "block"; // Show loader
        rowContainer.innerHTML = "";    // Clear album area while loading

        try {
            const userDocRef = doc(db, "users", user.uid);
            const userDocSnap = await getDoc(userDocRef);

            if (!userDocSnap.exists() || !userDocSnap.data().purchases || userDocSnap.data().purchases.length === 0) {
                headerEl.textContent = "No purchases yet";
                loader.style.display = "none"; // Hide loader
                return;
            }

            headerEl.textContent = "Your purchases";
            const purchases = userDocSnap.data().purchases;

            let albumsArray = [];
            for (const albumId of purchases) {
                const albumDocRef = doc(db, "albums", albumId);
                const albumDocSnap = await getDoc(albumDocRef);
                if (albumDocSnap.exists()) {
                    const album = albumDocSnap.data();
                    album.id = albumId;
                    albumsArray.push(album);
                } else {
                    console.warn(`Album with ID ${albumId} not found.`);
                }
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
            loader.style.display = "none"; // Always hide loader when done
        }
    });
});