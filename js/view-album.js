// view-album.js
import { app } from "/js/firebase-init.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";

const db = getFirestore(app);

// Retrieve the album ID from the URL query parameter "album"
const params = new URLSearchParams(window.location.search);
const albumId = params.get("album");

if (!albumId) {
    // If no album ID is provided, display an error message.
    document.getElementById("album-card-container").innerHTML = "<p>Error: No album specified.</p>";
} else {
    // Fetch the album document from Firestore.
    const albumDocRef = doc(db, "albums", albumId);
    getDoc(albumDocRef)
        .then((docSnap) => {
            if (docSnap.exists()) {
                const album = docSnap.data();

                // Build the card HTML using template literals.
                const cardHtml = `
                <div class="card my-5 mx-3" style="width: 75rem;">
                    <img src="${album.coverImage || 'https://via.placeholder.com/1200x400'}" class="card-img-top" alt="...">
                    <div class="card-body p-0">
                        <div class="row g-0">

                            <div class="col-md-8 p-4 border-end">

                                <h1 class="card-title">
                                  ${album.title || "Untitled Album"}
                                  ${album.fullAlbumPrice ? `<span class="badge rounded-pill text-bg-success fw-bolder py-2 ms-3">$${album.fullAlbumPrice}</span>` : ""}
                                </h1>

                                <hr width="100%" class="my-4">
                                
                                <h3 class="card-text fw-normal">
                                  ${album.description || ""}
                                </h3>
                                
                            </div>
                        
                            <div class="col-md-4 px-4">

                                <div class="container my-4">
                                    <button class="btn btn-primary w-100">Pay</button>

                                    <div class="border border-2 rounded-2 p-3 text-center w-100 my-3 fw-bold font-monospace">
                                        Hosted by ${album.host || "Unknown"}
                                    </div>

                                    <p class="text-center fw-bold">No refunds allowed</p>
                                </div>
                                
                            </div>
                        </div>
                    </div>
                </div>
              `;

                // Insert the generated card into the container.
                document.getElementById("album-card-container").innerHTML = cardHtml;
            } else {
                document.getElementById("album-card-container").innerHTML = "<p>Error: Album not found.</p>";
            }
        })
        .catch((error) => {
            console.error("Error fetching album:", error);
            document.getElementById("album-card-container").innerHTML = `<p>Error fetching album: ${error.message}</p>`;
        });
}
