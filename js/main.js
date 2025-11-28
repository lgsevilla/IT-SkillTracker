import { initDashboardPage } from "./view/dashboardView.js";
import { initDetallePage } from "./view/detalleView.js";
import { initFavoritesPage } from "./view/favoritesView.js";

function getCurrentPage() {
    const path = window.location.pathname;      // e.g. "/IT-SkillTracker/" o "/IT-SkillTracker/detalle.html"
    const segments = path.split("/").filter(Boolean);
    const last = segments[segments.length - 1] || "index.html"; // si acaba en "/", last será undefined

    // last será:
    // - "index.html" (si accedes a /index.html)
    // - "IT-SkillTracker" (si algún día pones un index en root del user)
    // - "detalle.html"
    // - "favorites.html"
    // - o "IT-SkillTracker" cuando la URL es "/IT-SkillTracker/"

    if (last === "index.html" || last === "IT-SkillTracker") {
        return "dashboard";
    }
    if (last === "detalle.html") {
        return "detalle";
    }
    if (last === "favorites.html") {
        return "favorites";
    }

    return "dashboard";   // fallback razonable
}

document.addEventListener("DOMContentLoaded", () => {
    const page = getCurrentPage();
    console.log("[Main] current page:", page, "pathname:", window.location.pathname);

    switch (page) {
        case "dashboard":
            initDashboardPage();
            break;
        case "detalle":
            initDetallePage();
            break;
        case "favorites":
            initFavoritesPage();
            break;
        default:
            // por si acaso, podrías llamar al dashboard también
            // initDashboardPage();
            break;
    }
});