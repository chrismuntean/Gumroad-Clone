document.addEventListener('DOMContentLoaded', function () {
    const container = document.getElementById('container');
    if (!container) return console.error('No #container element found');

    // 1. figure out section name from URL, e.g. "/portfolio/concerts"
    const parts = window.location.pathname.split('/').filter(Boolean);
    const portIdx = parts.indexOf('portfolio');
    if (portIdx === -1 || parts.length <= portIdx + 1) {
        return console.error('Could not determine portfolio section from URL');
    }
    const section = parts[portIdx + 1]; // "concerts" or "events" or "private-shoots"

    // 2. fetch a manifest.json that lives at /portfolio/images/manifest.json
    //    manifest.json should look like:
    //    {
    //      "concerts": ["a.jpg","b.jpg",...],
    //      "events":   ["x.png","y.png",...],
    //      "private-shoots": ["p1.jpg",...]
    //    }
    fetch(`/portfolio/images/manifest.json`)
        .then(res => {
            if (!res.ok) throw new Error('Failed to load image manifest');
            return res.json();
        })
        .then(manifest => {
            const list = manifest[section];
            if (!Array.isArray(list)) {
                console.error(`No image list for section "${section}"`);
                return;
            }

            // 3. for each filename, insert an <img> tag into the container
            list.forEach(filename => {
                const img = document.createElement('img');
                img.src = `/portfolio/images/${section}/${filename}`;
                img.alt = filename;
                img.className = 'img-fluid';

                img.onload = function () {
                    if (img.naturalWidth > img.naturalHeight) {
                        img.classList.add('w-100');
                    }
                };

                container.appendChild(img);
            });
        })
        .catch(err => console.error(err));
});
