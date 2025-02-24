// album-cards.js
import { app } from "/js/firebase-init.js";
import { getFirestore, collection, onSnapshot } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";

const db = getFirestore(app);
const albumsCol = collection(db, "albums");

// Select the container where the album cards will be inserted.
// This assumes your HTML has a container structure like:
// <div class="container text-center py-5">
//   <div class="row row-cols-2 row-cols-lg-5 g-2 g-lg-3 justify-content-center">
//     <!-- cards will be appended here -->
//   </div>
// </div>
const rowContainer = document.querySelector(".container.text-center.py-5 .row");

onSnapshot(albumsCol, (snapshot) => {
  // Clear any existing cards
  rowContainer.innerHTML = "";
  
  snapshot.forEach((docSnap) => {
    const album = docSnap.data();
    const albumId = docSnap.id;
    
    // Create card container
    const cardDiv = document.createElement("div");
    cardDiv.className = "card col m-3 px-0";
    cardDiv.style.width = "18rem";
    
    // Card image
    const img = document.createElement("img");
    img.className = "card-img-top";
    img.alt = album.title || "Album Cover";
    img.src = album.coverImage || "https://via.placeholder.com/286x180";
    cardDiv.appendChild(img);
    
    // Card body
    const cardBody = document.createElement("div");
    cardBody.className = "card-body";
    
    // Card title with price badge
    const titleH5 = document.createElement("h5");
    titleH5.className = "card-title";
    titleH5.textContent = album.title || "Untitled Album";
    if (album.fullAlbumPrice) {
      const badge = document.createElement("span");
      badge.className = "badge rounded-pill text-bg-success fw-bolder ms-1";
      badge.textContent = "$" + album.fullAlbumPrice;
      titleH5.appendChild(badge);
    }
    cardBody.appendChild(titleH5);
    
    // Card text for date
    const dateP = document.createElement("p");
    dateP.className = "card-text text-muted";
    dateP.textContent = album.date || "";
    cardBody.appendChild(dateP);
    
    // "View album" link – using a query parameter for the album ID
    const viewLink = document.createElement("a");
    viewLink.className = "btn btn-primary";
    viewLink.href = "/view?album=" + encodeURIComponent(albumId);
    viewLink.textContent = "View album";
    cardBody.appendChild(viewLink);
    
    cardDiv.appendChild(cardBody);
    rowContainer.appendChild(cardDiv);
  });
});
