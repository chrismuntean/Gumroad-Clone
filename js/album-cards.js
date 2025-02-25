import { app } from "/js/firebase-init.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";
import { getFirestore, doc, getDoc, collection, onSnapshot } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";

const auth = getAuth(app);
const db = getFirestore(app);

// Global variable to store current user's purchases
let currentUserPurchases = null;
// Global variable to store album snapshot data (an array of document snapshots)
let albumDocs = [];

// Reference to the container row where cards will be injected.
const rowContainer = document.querySelector(".container.text-center.py-5 .row");

// Function to render album cards using currentUserPurchases and albumDocs.
function renderAlbums() {
  // Sort albumDocs by "createdAt" descending (newest first)
  albumDocs.sort((a, b) => {
    // If createdAt field is missing, treat it as 0.
    const aTime = a.data().createdAt ? a.data().createdAt.toMillis() : 0;
    const bTime = b.data().createdAt ? b.data().createdAt.toMillis() : 0;
    return bTime - aTime;
  });

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

    // If currentUserPurchases is loaded and contains this album's ID, mark it as OWNED.
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
      // Otherwise, use the standard view route with albumId as query parameter.
      viewLink.href = "/view/?album=" + encodeURIComponent(albumId);
    }
    viewLink.textContent = "View album";
    cardBody.appendChild(viewLink);

    cardDiv.appendChild(cardBody);
    rowContainer.appendChild(cardDiv);
  });
}

// Listen for auth state changes to load user's purchases.
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
  // Re-render albums once auth state is determined.
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