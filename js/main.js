import { initDashboardPage } from "./view/dashboardView.js";
import { initDetallePage } from "./view/detalleView.js";
import { initFavoritesPage } from "./view/favoritesView.js";

function getCurrentPage() {
    const path = window.location.pathname;
    const last = path.split("/").filter(Boolean).pop() || "index.html";

    // Normalize cases
    if (last === "index.html") return "dashboard";
    if (last === "detalle.html") return "detalle";
    if (last === "favorites.html") return "favorites";

    // GitHub Pages root of project "/REPO/" → last = "IT-SkillTracker"
    // If the last segment matches your repository name → dashboard
    if (last === "IT-SkillTracker") return "dashboard";

    return "dashboard";  // fallback
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