// admin-albums.js
import { app } from "/js/firebase-init.js";
import {
  getFirestore,
  collection,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";

// Initialize Firestore and reference the "albums" collection
const db = getFirestore(app);
const albumsCol = collection(db, "albums");

// Get a reference to the table body where album rows will be rendered
const tbody = document.querySelector("table tbody");

// Function to render albums in the table
function renderAlbums(snapshot) {
  tbody.innerHTML = "";
  let index = 1;
  snapshot.forEach((docSnap) => {
    const album = docSnap.data();

    const tr = document.createElement("tr");
    tr.classList.add("align-middle");

    // Index column
    const indexTd = document.createElement("th");
    indexTd.scope = "row";
    indexTd.textContent = index;
    tr.appendChild(indexTd);

    // Cover image column
    const coverTd = document.createElement("td");
    const img = document.createElement("img");
    img.classList.add("rounded");
    img.width = 200;
    img.src = album.coverImage || "https://via.placeholder.com/200";
    img.alt = album.title || "Album Cover";
    coverTd.appendChild(img);
    tr.appendChild(coverTd);

    // Title column
    const titleTd = document.createElement("td");
    titleTd.textContent = album.title || "Untitled Album";
    tr.appendChild(titleTd);

    // Lightroom link column
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

    // Single image price column
    const singlePriceTd = document.createElement("td");
    singlePriceTd.textContent = album.singlePrice ? `$${album.singlePrice}` : "-";
    tr.appendChild(singlePriceTd);

    // Full album price column
    const fullPriceTd = document.createElement("td");
    fullPriceTd.textContent = album.fullAlbumPrice ? `$${album.fullAlbumPrice}` : "-";
    tr.appendChild(fullPriceTd);

    // Watermarked column
    const watermarkedTd = document.createElement("td");
    watermarkedTd.textContent = album.watermarked ? "YES" : "NO";
    tr.appendChild(watermarkedTd);

    // Actions column (Edit and Delete)
    const actionTd = document.createElement("td");

    // Edit Button (stubbed)
    const editBtn = document.createElement("button");
    editBtn.classList.add("btn", "btn-outline-warning", "py-2", "mx-1");
    editBtn.innerHTML = '<i class="bi bi-pencil-square"></i>';
    editBtn.addEventListener("click", () => {
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
    tbody.appendChild(tr);
    index++;
  });
}

// Listen for real-time updates in the "albums" collection
onSnapshot(albumsCol, renderAlbums);

// ===== Modal Integration for Adding Albums =====

// Reference the "Add Album" button and the modal element
const addAlbumBtn = document.getElementById("add-album-btn");
const addAlbumModalElement = document.getElementById("addAlbumModal");
const addAlbumModal = new bootstrap.Modal(addAlbumModalElement);

// When the "Add Album" button is clicked, show the modal
addAlbumBtn.addEventListener("click", () => {
  addAlbumModal.show();
});

// When the "Save Album" button in the modal is clicked
const saveAlbumBtn = document.getElementById("save-album-btn");
saveAlbumBtn.addEventListener("click", async () => {
  // Collect form values
  const title = document.getElementById("album-title").value.trim();
  const coverImage = document.getElementById("album-cover").value.trim();
  const lightroomLink = document.getElementById("lightroom-link").value.trim();
  const singlePrice = parseFloat(document.getElementById("single-price").value.trim());
  const fullAlbumPrice = parseFloat(document.getElementById("full-album-price").value.trim());
  const watermarked = document.getElementById("watermarked").checked;

  // Basic validation
  if (!title || !coverImage || !lightroomLink || isNaN(singlePrice) || isNaN(fullAlbumPrice)) {
    alert("Please fill in all required fields correctly.");
    return;
  }

  try {
    // Save the new album to Firestore
    const docRef = await addDoc(albumsCol, {
      title,
      coverImage,
      lightroomLink,
      singlePrice,
      fullAlbumPrice,
      watermarked,
      createdAt: new Date()
    });
    alert("Album added successfully with ID: " + docRef.id);
    // Hide the modal and reset the form
    addAlbumModal.hide();
    document.getElementById("album-form").reset();
  } catch (error) {
    console.error("Error adding album:", error);
    alert("Error adding album: " + error.message);
  }
});