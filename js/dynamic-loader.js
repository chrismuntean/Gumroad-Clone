// Function to load external HTML
function loadHTML(elementId, url, callback) {
    fetch(url)
        .then(response => response.text())
        .then(data => {
            document.getElementById(elementId).insertAdjacentHTML('beforebegin', data);
            document.getElementById(elementId).remove();
            if (callback) callback();
        });
}

// Load header and footer
loadHTML('nav', '/nav.html');
loadHTML('footer', '/footer.html');