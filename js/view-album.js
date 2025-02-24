// view-album.js
import { app } from "/js/firebase-init.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";

const db = getFirestore(app);
const auth = getAuth(app);

// Retrieve the album ID from the URL query parameter "album"
const params = new URLSearchParams(window.location.search);
const albumId = params.get("album");

if (!albumId) {
  document.getElementById("album-card-container").innerHTML = "<p>Error: No album specified.</p>";
} else {
  // Fetch the album document from Firestore.
  const albumDocRef = doc(db, "albums", albumId);
  getDoc(albumDocRef)
    .then((docSnap) => {
      if (docSnap.exists()) {
        const album = docSnap.data();

        // Build the card HTML using template literals.
        // The "Pay" button now has an id of "pay-btn"
        const cardHtml = `
          <div class="card my-5 mx-3" style="width: 75rem;">
            <img src="${album.coverImage || 'https://via.placeholder.com/1200x400'}" class="card-img-top" alt="${album.title}">
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
                    <button id="pay-btn" class="btn btn-primary w-100">Pay</button>
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

        document.getElementById("album-card-container").innerHTML = cardHtml;

        // Attach a click event to the Pay button.
        const payBtn = document.getElementById("pay-btn");
        payBtn.addEventListener("click", async () => {
          // Check if user is logged in.
          if (!auth.currentUser) {
            window.location.href = "/login";
            return;
          }
          try {
            // Build payload to send to the Cloudflare Worker.
            const payload = {
              albumName: album.title,
              price: album.fullAlbumPrice,  // Ensure this is a number representing price in cents.
              userEmail: auth.currentUser.email
            };
            const response = await fetch("https://create-checkout-session.chrismunt123.workers.dev/", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload)
            });
            const data = await response.json();
            if (data.payment_link.url) {
              // Redirect to the Square hosted checkout page.
              window.location.href = data.payment_link.url;
            } else {
              alert("Failed to create checkout session.");
            }
          } catch (error) {
            console.error("Error creating checkout session:", error);
            alert("Error initiating payment: " + error.message);
          }
        });
      } else {
        document.getElementById("album-card-container").innerHTML = "<p>Error: Album not found.</p>";
      }
    })
    .catch((error) => {
      console.error("Error fetching album:", error);
      document.getElementById("album-card-container").innerHTML = `<p>Error fetching album: ${error.message}</p>`;
    });
}