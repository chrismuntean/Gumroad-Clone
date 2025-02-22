// admin-albums.js
import { app } from "/js/firebase-init.js";
import {
  getFirestore,
  collection,
  onSnapshot,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";

// Initialize Firestore
const db = getFirestore(app);
// Reference to the "albums" collection
const albumsCol = collection(db, "albums");

// Get a reference to the table body in the Manage Albums page
const tbody = document.querySelector("table tbody");

// Function to render albums in the table
function renderAlbums(snapshot) {
  // Clear the table body before rendering new rows
  tbody.innerHTML = "";
  let index = 1;
  snapshot.forEach((docSnap) => {
    const album = docSnap.data();

    // Create a new table row
    const tr = document.createElement("tr");
    tr.classList.add("align-middle");

    // Column: Index #
    const indexTd = document.createElement("th");
    indexTd.scope = "row";
    indexTd.textContent = index;
    tr.appendChild(indexTd);

    // Column: Cover Image
    const coverTd = document.createElement("td");
    const img = document.createElement("img");
    img.classList.add("rounded");
    img.width = 200;
    // If a coverImage field exists, use it; otherwise, use a placeholder image.
    img.src = album.coverImage || "https://via.placeholder.com/200";
    img.alt = album.title || "Album Cover";
    coverTd.appendChild(img);
    tr.appendChild(coverTd);

    // Column: Title
    const titleTd = document.createElement("td");
    titleTd.textContent = album.title || "Untitled Album";
    tr.appendChild(titleTd);

    // Column: Lightroom Link
    const linkTd = document.createElement("td");
    if (album.lightroomLink) {
      const a = document.createElement("a");
      a.href = album.lightroomLink;
      a.textContent = album.lightroomLink;
      a.target = "_blank";
      linkTd.appendChild(a);
    } else {
      linkTd.textContent = "No link";
    }
    tr.appendChild(linkTd);

    // Column: Single Image Price
    const singlePriceTd = document.createElement("td");
    singlePriceTd.textContent = album.singlePrice ? `$${album.singlePrice}` : "-";
    tr.appendChild(singlePriceTd);

    // Column: Full Album Price
    const fullPriceTd = document.createElement("td");
    fullPriceTd.textContent = album.fullAlbumPrice ? `$${album.fullAlbumPrice}` : "-";
    tr.appendChild(fullPriceTd);

    // Column: Watermarked?
    const watermarkedTd = document.createElement("td");
    watermarkedTd.textContent = album.watermarked ? "YES" : "NO";
    tr.appendChild(watermarkedTd);

    // Column: Actions (Edit and Delete)
    const actionTd = document.createElement("td");

    // Edit Button (stubbed)
    const editBtn = document.createElement("button");
    editBtn.classList.add("btn", "btn-outline-warning", "py-2", "mx-1");
    editBtn.innerHTML = '<i class="bi bi-pencil-square"></i>';
    editBtn.addEventListener("click", () => {
      // TODO: Implement edit functionality (e.g., open an edit modal)
      alert("Edit functionality not implemented yet.");
    });
    actionTd.appendChild(editBtn);

    // Delete Button
    const deleteBtn = document.createElement("button");
    deleteBtn.classList.add("btn", "btn-outline-danger", "py-2", "mx-1");
    deleteBtn.innerHTML = '<i class="bi bi-trash"></i>';
    deleteBtn.addEventListener("click", async () => {
      if (confirm("Are you sure you want to delete this album?")) {
        try {
          await deleteDoc(doc(db, "albums", docSnap.id));
          alert("Album deleted successfully.");
        } catch (error) {
          console.error("Error deleting album:", error);
          alert("Error deleting album: " + error.message);
        }
      }
    });
    actionTd.appendChild(deleteBtn);

    tr.appendChild(actionTd);

    // Append the row to the table body
    tbody.appendChild(tr);
    index++;
  });
}

// Listen for real-time updates on the "albums" collection
onSnapshot(albumsCol, renderAlbums);
