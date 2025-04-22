import { app } from "/js/firebase-init.js";
import {
  getFirestore,
  collection,
  onSnapshot,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  serverTimestamp,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";

// Initialize Firestore and reference the "portfolioAlbums" collection
const db = getFirestore(app);
const portfoliosCol = collection(db, "portfolioAlbums");

// Reference to table body where rows will be rendered
const tbody = document.querySelector("table tbody");

// Track current editing document ID
let currentEditId = null;

// Render all portfolio albums, sorted by createdAt descending
const q = query(portfoliosCol, orderBy("createdAt", "desc"));
onSnapshot(q, snapshot => {
  tbody.innerHTML = '';
  let index = 1;

  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    const id = docSnap.id;

    const tr = document.createElement('tr');
    tr.classList.add('align-middle');

    // Index
    const idxTd = document.createElement('th');
    idxTd.scope = 'row';
    idxTd.textContent = index++;
    tr.appendChild(idxTd);

    // Cover Image
    const coverTd = document.createElement('td');
    const img = document.createElement('img');
    img.width = 200;
    img.classList.add('rounded');
    img.src = data.coverImage || '/assets/img-static/camera-lens.png';
    img.alt = data.title || 'Cover Image';
    coverTd.appendChild(img);
    tr.appendChild(coverTd);

    // Title
    const titleTd = document.createElement('td');
    titleTd.textContent = data.title || '-';
    tr.appendChild(titleTd);

    // Lightroom Link
    const linkTd = document.createElement('td');
    if (data.lightroomLink) {
      const a = document.createElement('a');
      a.href = data.lightroomLink;
      a.textContent = data.lightroomLink;
      a.target = '_blank';
      linkTd.appendChild(a);
    } else {
      linkTd.textContent = '-';
    }
    tr.appendChild(linkTd);

    // Action (Delete)
    const actionTd = document.createElement('td');
    const deleteBtn = document.createElement('button');
    deleteBtn.classList.add('btn', 'btn-outline-danger', 'py-2', 'mx-1');
    deleteBtn.innerHTML = '<i class="bi bi-trash"></i>';
    deleteBtn.addEventListener('click', async () => {
      if (confirm('Delete this portfolio album?')) {
        try {
          await deleteDoc(doc(db, 'portfolioAlbums', id));
        } catch (err) {
          console.error('Delete error:', err);
          alert('Failed to delete.');
        }
      }
    });
    actionTd.appendChild(deleteBtn);
    tr.appendChild(actionTd);

    tbody.appendChild(tr);
  });
});

// Modal setup
document.getElementById('add-album-btn').addEventListener('click', () => {
  currentEditId = null;
  document.getElementById('album-form').reset();
  bootstrap.Modal.getOrCreateInstance(document.getElementById('addAlbumModal')).show();
});

// Save new portfolio album
document.getElementById('save-album-btn').addEventListener('click', async () => {
  const title = document.getElementById('album-title').value.trim();
  const cover = document.getElementById('album-cover').value.trim();
  const link = document.getElementById('lightroom-link').value.trim();
  if (!title || !cover || !link) {
    alert('Please fill in all fields.');
    return;
  }
  try {
    await addDoc(portfoliosCol, {
      title,
      coverImage: cover,
      lightroomLink: link,
      createdAt: serverTimestamp()
    });
    bootstrap.Modal.getInstance(document.getElementById('addAlbumModal')).hide();
  } catch (err) {
    console.error('Add error:', err);
    alert('Failed to add album.');
  }
});