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
const tbody = document.querySelector("table tbody");
let currentEditId = null;

function renderAlbums(snapshot) {
    let albumArray = [];
    snapshot.forEach((docSnap) => albumArray.push(docSnap));

    albumArray.sort((a, b) => {
        const cleanDate = (str) => new Date(str.replace(/(\d+)(st|nd|rd|th)/, "$1")).getTime();
        return cleanDate(b.data().date) - cleanDate(a.data().date);
    });

    tbody.innerHTML = "";
    let index = 1;

    albumArray.forEach((docSnap) => {
        const album = docSnap.data();
        const albumId = docSnap.id;

        const tr = document.createElement("tr");
        tr.classList.add("align-middle");

        const indexTd = document.createElement("th");
        indexTd.scope = "row";
        indexTd.textContent = index;
        tr.appendChild(indexTd);

        const coverTd = document.createElement("td");
        const img = document.createElement("img");
        img.classList.add("rounded");
        img.width = 200;
        img.src = album.coverImage;
        img.alt = album.title;
        coverTd.appendChild(img);
        tr.appendChild(coverTd);

        const titleTd = document.createElement("td");
        titleTd.textContent = album.title;
        tr.appendChild(titleTd);

        const dateTd = document.createElement("td");
        dateTd.textContent = album.date;
        tr.appendChild(dateTd);

        const hostTd = document.createElement("td");
        hostTd.textContent = album.host;
        tr.appendChild(hostTd);

        const descriptionTd = document.createElement("td");
        let desc = album.description;
        if (desc.length > 10) desc = desc.substring(0, 10) + "...";
        descriptionTd.innerHTML = desc.replace(/\n/g, "<br>");
        tr.appendChild(descriptionTd);

        const linkTd = document.createElement("td");
        const a = document.createElement("a");
        a.href = album.lightroomLink;
        a.textContent = album.lightroomLink;
        a.target = "_blank";
        linkTd.appendChild(a);
        tr.appendChild(linkTd);

        const fullPriceTd = document.createElement("td");
        fullPriceTd.textContent = `$${album.fullAlbumPrice}`;
        tr.appendChild(fullPriceTd);

        const actionTd = document.createElement("td");

        const editBtn = document.createElement("button");
        editBtn.classList.add("btn", "btn-outline-warning", "py-2", "mx-1", "my-2");
        editBtn.innerHTML = '<i class="bi bi-pencil-square"></i>';
        editBtn.addEventListener("click", () => {
            currentEditId = albumId;
            document.getElementById("edit-album-title").value = album.title;
            document.getElementById("edit-album-cover").value = album.coverImage;
            document.getElementById("edit-album-date").value = album.date;
            document.getElementById("edit-album-host").value = album.host;
            document.getElementById("edit-album-description").value = album.description;
            document.getElementById("edit-lightroom-link").value = album.lightroomLink;
            document.getElementById("edit-full-album-price").value = album.fullAlbumPrice;
            const editAlbumModal = new bootstrap.Modal(document.getElementById("editAlbumModal"));
            editAlbumModal.show();
        });
        actionTd.appendChild(editBtn);

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

onSnapshot(albumsCol, renderAlbums);

// ===== Add Album Modal =====
const addAlbumBtn = document.getElementById("add-album-btn");
const addAlbumModalElement = document.getElementById("addAlbumModal");
const addAlbumModal = new bootstrap.Modal(addAlbumModalElement);

addAlbumBtn.addEventListener("click", () => {
    addAlbumModal.show();
});

const saveAlbumBtn = document.getElementById("save-album-btn");
saveAlbumBtn.addEventListener("click", async () => {
    const title = document.getElementById("album-title").value.trim();
    const coverImage = document.getElementById("album-cover").value.trim();
    const date = document.getElementById("album-date").value.trim();
    const host = document.getElementById("album-host").value.trim();
    const description = document.getElementById("album-description").value.trim();
    const lightroomLink = document.getElementById("lightroom-link").value.trim();
    const fullAlbumPrice = parseFloat(document.getElementById("full-album-price").value.trim());

    if (!title || !coverImage || !date || !host || !description || !lightroomLink || isNaN(fullAlbumPrice)) {
        alert("Please fill in all required fields correctly.");
        return;
    }

    try {
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
        addAlbumModal.hide();
        document.getElementById("album-form").reset();
    } catch (error) {
        console.error("Error adding album:", error);
        alert("Error adding album: " + error.message);
    }
});

// ===== Edit Album Modal =====
const updateAlbumBtn = document.getElementById("update-album-btn");
updateAlbumBtn.addEventListener("click", async () => {
    if (!currentEditId) {
        alert("No album selected for editing.");
        return;
    }

    const title = document.getElementById("edit-album-title").value.trim();
    const coverImage = document.getElementById("edit-album-cover").value.trim();
    const date = document.getElementById("edit-album-date").value.trim();
    const host = document.getElementById("edit-album-host").value.trim();
    const description = document.getElementById("edit-album-description").value.trim();
    const lightroomLink = document.getElementById("edit-lightroom-link").value.trim();
    const fullAlbumPrice = parseFloat(document.getElementById("edit-full-album-price").value.trim());

    if (!title || !coverImage || !date || !host || !description || !lightroomLink || isNaN(fullAlbumPrice)) {
        alert("Please fill in all required fields correctly.");
        return;
    }

    try {
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
        const editAlbumModalElement = document.getElementById("editAlbumModal");
        const editAlbumModal = bootstrap.Modal.getInstance(editAlbumModalElement);
        editAlbumModal.hide();
        document.getElementById("edit-album-form").reset();
        currentEditId = null;
    } catch (error) {
        console.error("Error updating album:", error);
        alert("Error updating album: " + error.message);
    }
});