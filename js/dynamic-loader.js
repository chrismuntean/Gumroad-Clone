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

// Check current path
const isPortfolioPage = window.location.pathname.includes("portfolio");

// Run logic only on portfolio page
loadHTML('nav', '/nav.html', () => {
    if (isPortfolioPage) {
        const portfolioNav = document.getElementById("portfolio-nav");
        if (portfolioNav) portfolioNav.remove();
    }
});

// Load footer HTML
loadHTML('footer', '/footer.html');