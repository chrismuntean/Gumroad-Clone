// TODO: Fix sticky footer animation. Currently broken do

import { app } from "/js/firebase-init.js";
import {
  getFirestore,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";
import { getAnalytics, logEvent } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-analytics.js";

const db = getFirestore(app);
const auth = getAuth(app);
const analytics = getAnalytics(app);

// Retrieve the album ID from the URL query parameter "album"
const params = new URLSearchParams(window.location.search);
const albumId = params.get("album");

if (!albumId) {
  document.getElementById("album-card-container").innerHTML =
    '<h1 class="fw-normal">Error: <span class="text-danger fw-bold">No album specified</span></h1>';
} else {
  // Fetch the album document from Firestore.
  const albumDocRef = doc(db, "albums", albumId);
  getDoc(albumDocRef)
    .then((docSnap) => {
      if (docSnap.exists()) {
        const album = docSnap.data();

        // Build the main album card HTML.
        const cardHtml = `
          <div class="card my-5 mx-3" style="width: 75rem;">
            <img src="${album.coverImage || '/assets/img-static/camera-lens.png'}" class="card-img-top" alt="${album.title}">
            <div class="card-body p-0">
              <div class="row g-0">
                <div class="col-md-8 p-4 border-end">
                  <h1 class="card-title fw-normal">
                    ${album.title || "Untitled Album"}
                    ${album.fullAlbumPrice ? `<span class="badge rounded-pill text-bg-success fw-bolder py-2">$${album.fullAlbumPrice}</span>` : ""}
                  </h1>
                  <h5 class="fw-normal text-muted">${album.date}</h5>
                  <hr width="100%" class="my-4">
                  <h3 class="card-text fw-normal">
                    ${album.description || ""}
                  </h3>
                </div>
                <div class="col-md-4 px-4">
                  <div class="container my-4">
                    <button id="pay-btn" class="btn btn-primary w-100">Purchase album</button>
                    <div class="border border-2 rounded-2 p-3 text-center w-100 my-3 fw-bold font-monospace">
                      Hosted by ${album.host || "Unknown"}
                    </div>
                    <p class="text-center fw-bold font-monospace">No refunds allowed</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `;
        document.getElementById("album-card-container").innerHTML = cardHtml;

        // Inject dynamic sticky footer content.
        const stickyFooter = document.getElementById("sticky-footer");
        if (stickyFooter) {
          stickyFooter.innerHTML = `
            <div class="row">
              <div class="col text-start mt-1">
                <h1><span class="badge rounded-pill text-bg-success fw-bolder py-2">$${album.fullAlbumPrice}</span></h1>
              </div>
              <div class="col text-end">
                <button id="sticky-pay-btn" class="btn btn-primary">Purchase album</button>
              </div>
            </div>
          `;
        }

        // Define the purchase handler (shared between main and sticky buttons).
        const purchaseHandler = () => {
          onAuthStateChanged(auth, async (user) => {
            if (!user) {
              window.location.href = "/login";
              return;
            }
            try {
              logEvent(analytics, 'purchase_initiated', {
                albumId: albumId,
                albumName: album.title,
                price: album.fullAlbumPrice
              });

              const payload = {
                albumName: album.title,
                albumId: albumId,
                price: album.fullAlbumPrice,
                buyerEmail: user.email
              };

              const response = await fetch("/api/create-checkout-session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
              });
              const data = await response.json();
              if (data.payment_link && data.payment_link.url) {
                window.location.href = data.payment_link.url;
              } else {
                alert("Failed to create checkout session.");
              }
            } catch (error) {
              console.error("Error creating checkout session:", error);
              alert("Error initiating payment: " + error.message);
            }
          });
        };

        // Attach event handlers to both buttons.
        const payBtn = document.getElementById("pay-btn");
        if (payBtn) {
          payBtn.addEventListener("click", purchaseHandler);
        }
        const stickyPayBtn = document.getElementById("sticky-pay-btn");
        if (stickyPayBtn) {
          stickyPayBtn.addEventListener("click", purchaseHandler);
        }

        // Set up Intersection Observer for the sticky footer.
        if (payBtn && stickyFooter) {
          const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
              if (entry.isIntersecting) {
                // Main pay button is in view: hide the sticky footer with an animation.
                stickyFooter.classList.remove("visible");
                stickyFooter.classList.add("d-none");
              } else {
                // Main pay button is not in view: show the sticky footer with an animation.
                stickyFooter.classList.add("visible");
                stickyFooter.classList.remove("d-none");
              }
            });
          }, { threshold: 0.1 });
          observer.observe(payBtn);
        }
      } else {
        document.getElementById("album-card-container").innerHTML =
          '<h1 class="fw-normal">Error: <span class="text-danger fw-bold">Album not found</span></h1>';
      }
    })
    .catch((error) => {
      console.error("Error fetching album:", error);
      document.getElementById("album-card-container").innerHTML =
        `<h1 class="fw-normal">Error fetching album: <span class="text-danger fw-bold">${error.message}</span></h1>`;
    });
}