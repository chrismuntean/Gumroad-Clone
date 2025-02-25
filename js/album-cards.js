import { app } from "/js/firebase-init.js";
import {
  getFirestore,
  collection,
  onSnapshot,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";

const db = getFirestore(app);
const auth = getAuth(app);

// Global variable to store current user's purchases
let currentUserPurchases = null;

// Global variable to store album snapshot data
let albumDocs = [];

// Reference to the row container where cards are inserted.
const rowContainer = document.querySelector(".container.text-center.py-5 .row");

// Function to render album cards using currentUserPurchases and albumDocs.
function renderAlbums() {
  // Clear existing content.
  rowContainer.innerHTML = "";

  albumDocs.forEach((docSnap) => {
    const album = docSnap.data();
    const albumId = docSnap.id;

    // Create card container.
    const cardDiv = document.createElement("div");
    cardDiv.className = "card col m-3 px-0";
    cardDiv.style.width = "18rem";

    // Card image.
    const img = document.createElement("img");
    img.className = "card-img-top";
    img.alt = album.title || "Album Cover";
    img.src = album.coverImage || "https://via.placeholder.com/286x180";
    cardDiv.appendChild(img);

    // Card body.
    const cardBody = document.createElement("div");
    cardBody.className = "card-body";

    // Title and badge.
    const titleH5 = document.createElement("h5");
    titleH5.className = "card-title";

    // Determine if the album is owned (if purchases have loaded and include this album's ID).
    if (currentUserPurchases && currentUserPurchases.includes(albumId)) {
      titleH5.innerHTML = `${album.title || "Untitled Album"} <span class="badge rounded-pill text-bg-primary fw-bolder ms-1">OWNED</span>`;
    } else {
      titleH5.textContent = album.title || "Untitled Album";
      if (album.fullAlbumPrice) {
        const badge = document.createElement("span");
        badge.className = "badge rounded-pill text-bg-success fw-bolder ms-1";
        badge.textContent = "$" + album.fullAlbumPrice;
        titleH5.appendChild(badge);
      }
    }
    cardBody.appendChild(titleH5);

    // Date text.
    const dateP = document.createElement("p");
    dateP.className = "card-text text-muted";
    dateP.textContent = album.date || "";
    cardBody.appendChild(dateP);

    // "View album" link.
    const viewLink = document.createElement("a");
    viewLink.className = "btn btn-primary";
    if (currentUserPurchases && currentUserPurchases.includes(albumId)) {
      // If owned, link to the actual lightroomLink.
      viewLink.href = album.lightroomLink || "#";
    } else {
      // Otherwise, use the standard view route.
      viewLink.href = "/view/?album=" + encodeURIComponent(albumId);
    }
    viewLink.textContent = "View album";
    cardBody.appendChild(viewLink);

    cardDiv.appendChild(cardBody);
    rowContainer.appendChild(cardDiv);
  });
}

// Listen for auth state changes to load user purchases.
onAuthStateChanged(auth, async (user) => {
  if (user) {
    try {
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);
      currentUserPurchases = userDocSnap.exists() ? userDocSnap.data().purchases || [] : [];
      console.log("Loaded purchases:", currentUserPurchases);
    } catch (error) {
      console.error("Error fetching user document:", error);
      currentUserPurchases = [];
    }
  } else {
    currentUserPurchases = null;
  }
  // Re-render the albums after auth state is determined.
  renderAlbums();
});

// Listen for real-time updates in the "albums" collection.
onSnapshot(collection(db, "albums"), (snapshot) => {
  albumDocs = [];
  snapshot.forEach((docSnap) => {
    albumDocs.push(docSnap);
  });
  renderAlbums();
});