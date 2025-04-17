// Remove the portfolio-nav ID section from DOM after it has been loaded
document.addEventListener("DOMContentLoaded", function() {
    var portfolioNav = document.getElementById("portfolio-nav");
    if (portfolioNav) {
        portfolioNav.remove();
    }
});