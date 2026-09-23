(function () {
    "use strict";

    var root = document.querySelector(".service-detail-main");

    if (!root) {
        return;
    }

    var panels = Array.from(root.querySelectorAll("[data-service-panel]"));
    var links = Array.from(root.querySelectorAll("[data-service-link]"));
    var menuButton = root.querySelector(".service-detail-mobile-nav__button");
    var mobileLinks = root.querySelector("#service-mobile-links");
    var validIds = panels.map(function (panel) {
        return panel.id;
    });

    function activateService(id, shouldFocus) {
        if (validIds.indexOf(id) === -1) {
            id = validIds[0];
        }

        panels.forEach(function (panel) {
            var isActive = panel.id === id;
            panel.hidden = !isActive;

            if (isActive && shouldFocus) {
                panel.setAttribute("tabindex", "-1");
                panel.focus({ preventScroll: true });
            }
        });

        links.forEach(function (link) {
            var isCurrent = link.getAttribute("href") === "#" + id;

            if (isCurrent) {
                link.setAttribute("aria-current", "page");
            } else {
                link.removeAttribute("aria-current");
            }
        });

        if (mobileLinks) {
            mobileLinks.hidden = true;
        }

        if (menuButton) {
            menuButton.setAttribute("aria-expanded", "false");
        }
    }

    links.forEach(function (link) {
        link.addEventListener("click", function (event) {
            var id = link.getAttribute("href").slice(1);

            event.preventDefault();
            activateService(id, true);
            history.pushState(null, "", "#" + id);

            if (window.matchMedia("(max-width: 959px)").matches) {
                root.querySelector(".service-detail-content").scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }
        });
    });

    if (menuButton && mobileLinks) {
        menuButton.addEventListener("click", function () {
            var isOpen = menuButton.getAttribute("aria-expanded") === "true";
            menuButton.setAttribute("aria-expanded", String(!isOpen));
            mobileLinks.hidden = isOpen;
        });
    }

    window.addEventListener("popstate", function () {
        activateService(window.location.hash.slice(1), false);
    });

    activateService(window.location.hash.slice(1), false);
})();
