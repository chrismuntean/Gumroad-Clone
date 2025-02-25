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

const db = getFirestore(app);
const albumsCol = collection(db, "albums");

// Reference to the table body where album rows will be rendered.
const tbody = document.querySelector("table tbody");

// Global variable to hold the ID of the album being edited
let currentEditId = null;

// Function to render albums in the table, sorted by "createdAt" (newest first)
function renderAlbums(snapshot) {
    // Build an array of document snapshots.
    let albumArray = [];
    snapshot.forEach((docSnap) => {
        albumArray.push(docSnap);
    });

    // Sort albums by createdAt timestamp descending (newest first)
    albumArray.sort((a, b) => {
        const aTime = a.data().createdAt ? a.data().createdAt.toMillis() : 0;
        const bTime = b.data().createdAt ? b.data().createdAt.toMillis() : 0;
        return bTime - aTime;
    });

    // Clear existing content.
    tbody.innerHTML = "";
    let index = 1;

    albumArray.forEach((docSnap) => {
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
        // Format the createdAt timestamp nicely if available, otherwise use album.date.
        if (album.createdAt) {
            const dateObj = album.createdAt.toDate();
            dateTd.textContent = dateObj.toLocaleString(); // e.g., "February 24, 2025, 8:50:13 PM"
        } else {
            dateTd.textContent = album.date || "-";
        }
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
        editBtn.classList.add("btn", "btn-outline-warning", "py-2", "mx-1", "my-2");
        editBtn.innerHTML = '<i class="bi bi-pencil-square"></i>';
        editBtn.addEventListener("click", () => {
            currentEditId = albumId;
            document.getElementById("edit-album-title").value = album.title || "";
            document.getElementById("edit-album-cover").value = album.coverImage || "";
            document.getElementById("edit-album-date").value = album.date || "";
            document.getElementById("edit-album-host").value = album.host || "";
            document.getElementById("edit-album-description").value = album.description || "";
            document.getElementById("edit-lightroom-link").value = album.lightroomLink || "";
            document.getElementById("edit-full-album-price").value = album.fullAlbumPrice || "";
            const editAlbumModal = new bootstrap.Modal(document.getElementById("editAlbumModal"));
            editAlbumModal.show();
        });
        actionTd.appendChild(editBtn);

        // Delete Button
        const deleteBtn = document.createElement("button");
        deleteBtn.classList.add("btn", "btn-outline-danger", "py-2", "mx-1", "my-2");
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