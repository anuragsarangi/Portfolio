const siteHeader = document.querySelector(".site-header");

function updateHeader() {
    if (!siteHeader) {
        return;
    }

    siteHeader.classList.toggle("scrolled", window.scrollY > 40);
}

window.addEventListener("scroll", updateHeader, { passive: true });

updateHeader();