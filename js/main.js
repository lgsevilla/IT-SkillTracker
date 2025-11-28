import { initDashboardPage } from "./view/dashboardView.js";
import { initDetallePage } from "./view/detalleView.js";
import { initFavoritesPage } from "./view/favoritesView.js";

function getCurrentPage() {
    const path = window.location.pathname;      // ej: "/IT-SkillTracker/" o "/IT-SkillTracker/detalle.html"
    const segments = path.split("/").filter(Boolean);
    // Si no hay último segmento, asumimos "index.html"
    const last = segments[segments.length - 1] || "index.html";

    if (last === "index.html") return "dashboard";
    if (last === "detalle.html") return "detalle";
    if (last === "favorites.html" || last === "favoritos.html") return "favorites";

    return "dashboard"; // fallback razonable
}

document.addEventListener("DOMContentLoaded", () => {
    const page = getCurrentPage();

    switch (page) {
        case "dashboard":
            initDashboardPage().catch(err => {
                console.error("Error inicializando dashboard:", err);
            });
            break;

        case "detalle":
            initDetallePage().catch(err => {
                console.error("Error inicializando detalle:", err);
            });
            break;

        case "favorites":
            initFavoritesPage().catch(err => {
                console.error("Error inicializando favoritos:", err);
            });
            break;

        default:
            break;
    }
});