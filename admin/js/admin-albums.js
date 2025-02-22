// admin-albums.js
import { app } from "/js/firebase-init.js";
import {
    getFirestore,
    collection,
    onSnapshot,
    addDoc,
    deleteDoc,
    updateDoc,
    doc
} from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";

// Initialize Firestore and reference the "albums" collection
const db = getFirestore(app);
const albumsCol = collection(db, "albums");

// Reference to the table body where album rows will be rendered
const tbody = document.querySelector("table tbody");

// Global variable to hold the ID of the album being edited
let currentEditId = null;

// Function to render albums in the table
function renderAlbums(snapshot) {
    tbody.innerHTML = "";
    let index = 1;
    snapshot.forEach((docSnap) => {
        const album = docSnap.data();
        const albumId = docSnap.id;

        const tr = document.createElement("tr");
        tr.classList.add("align-middle");

        // Index column
        const indexTd = document.createElement("th");
        indexTd.scope = "row";
        indexTd.textContent = index;
        tr.appendChild(indexTd);

        // Cover Image column
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

        // Date column
        const dateTd = document.createElement("td");
        dateTd.textContent = album.date || "-";
        tr.appendChild(dateTd);

        // Host column
        const hostTd = document.createElement("td");
        hostTd.textContent = album.host || "-";
        tr.appendChild(hostTd);

        // Description column (truncate to 10 characters, with newlines converted to <br>)
        const descriptionTd = document.createElement("td");
        let desc = album.description || "-";
        if (desc.length > 10) {
            desc = desc.substring(0, 10) + "...";
        }
        descriptionTd.innerHTML = desc.replace(/\n/g, "<br>");
        tr.appendChild(descriptionTd);

        // Lightroom Link column
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

        // Full Album Price column
        const fullPriceTd = document.createElement("td");
        fullPriceTd.textContent = album.fullAlbumPrice ? `$${album.fullAlbumPrice}` : "-";
        tr.appendChild(fullPriceTd);

        // Actions column (Edit and Delete)
        const actionTd = document.createElement("td");

        // Edit Button
        const editBtn = document.createElement("button");
        editBtn.classList.add("btn", "btn-outline-warning", "py-2", "mx-1");
        editBtn.innerHTML = '<i class="bi bi-pencil-square"></i>';
        editBtn.addEventListener("click", () => {
            // Set currentEditId for later use in the update operation
            currentEditId = albumId;
            // Populate the edit modal with current album data
            document.getElementById("edit-album-title").value = album.title || "";
            document.getElementById("edit-album-cover").value = album.coverImage || "";
            document.getElementById("edit-album-date").value = album.date || "";
            document.getElementById("edit-album-host").value = album.host || "";
            document.getElementById("edit-album-description").value = album.description || "";
            document.getElementById("edit-lightroom-link").value = album.lightroomLink || "";
            document.getElementById("edit-full-album-price").value = album.fullAlbumPrice || "";

            // Show the edit modal
            const editAlbumModal = new bootstrap.Modal(document.getElementById("editAlbumModal"));
            editAlbumModal.show();
        });
        actionTd.appendChild(editBtn);

        // Delete Button
        const deleteBtn = document.createElement("button");
        deleteBtn.classList.add("btn", "btn-outline-danger", "py-2", "mx-1");
        deleteBtn.innerHTML = '<i class="bi bi-trash"></i>';
        deleteBtn.addEventListener("click", async () => {
            if (confirm("Are you sure you want to delete this album?")) {
                try {
                    await deleteDoc(doc(db, "albums", albumId));
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

// Reference the "Add Album" button and add album modal
const addAlbumBtn = document.getElementById("add-album-btn");
const addAlbumModalElement = document.getElementById("addAlbumModal");
const addAlbumModal = new bootstrap.Modal(addAlbumModalElement);

// Show the Add Album modal when its button is clicked
addAlbumBtn.addEventListener("click", () => {
    addAlbumModal.show();
});

// Handle the "Save Album" button click in the Add Album modal
const saveAlbumBtn = document.getElementById("save-album-btn");
saveAlbumBtn.addEventListener("click", async () => {
    // Collect form values from the Add Album modal
    const title = document.getElementById("album-title").value.trim();
    const coverImage = document.getElementById("album-cover").value.trim();
    const date = document.getElementById("album-date").value.trim();
    const host = document.getElementById("album-host").value.trim();
    const description = document.getElementById("album-description").value.trim();
    const lightroomLink = document.getElementById("lightroom-link").value.trim();
    const fullAlbumPrice = parseFloat(document.getElementById("full-album-price").value.trim());

    // Basic validation
    if (!title || !coverImage || !date || !host || !description || !lightroomLink || isNaN(fullAlbumPrice)) {
        alert("Please fill in all required fields correctly.");
        return;
    }

    try {
        // Save the new album to Firestore
        const docRef = await addDoc(albumsCol, {
            title,
            coverImage,
            date,
            host,
            description,
            lightroomLink,
            fullAlbumPrice,
            createdAt: new Date()
        });
        alert("Album added successfully with ID: " + docRef.id);
        // Hide the Add Album modal and reset its form
        addAlbumModal.hide();
        document.getElementById("album-form").reset();
    } catch (error) {
        console.error("Error adding album:", error);
        alert("Error adding album: " + error.message);
    }
});

// ===== Modal Integration for Editing Albums =====

// Handle the "Update Album" button click in the Edit Album modal
const updateAlbumBtn = document.getElementById("update-album-btn");
updateAlbumBtn.addEventListener("click", async () => {
    if (!currentEditId) {
        alert("No album selected for editing.");
        return;
    }

    // Collect form values from the Edit Album modal
    const title = document.getElementById("edit-album-title").value.trim();
    const coverImage = document.getElementById("edit-album-cover").value.trim();
    const date = document.getElementById("edit-album-date").value.trim();
    const host = document.getElementById("edit-album-host").value.trim();
    const description = document.getElementById("edit-album-description").value.trim();
    const lightroomLink = document.getElementById("edit-lightroom-link").value.trim();
    const fullAlbumPrice = parseFloat(document.getElementById("edit-full-album-price").value.trim());

    // Basic validation
    if (!title || !coverImage || !date || !host || !description || !lightroomLink || isNaN(fullAlbumPrice)) {
        alert("Please fill in all required fields correctly.");
        return;
    }

    try {
        // Update the album document in Firestore
        await updateDoc(doc(db, "albums", currentEditId), {
            title,
            coverImage,
            date,
            host,
            description,
            lightroomLink,
            fullAlbumPrice
        });
        alert("Album updated successfully.");
        // Hide the Edit Album modal and reset its form
        const editAlbumModalElement = document.getElementById("editAlbumModal");
        const editAlbumModal = bootstrap.Modal.getInstance(editAlbumModalElement);
        editAlbumModal.hide();
        document.getElementById("edit-album-form").reset();
        // Clear the current edit ID
        currentEditId = null;
    } catch (error) {
        console.error("Error updating album:", error);
        alert("Error updating album: " + error.message);
    }
});