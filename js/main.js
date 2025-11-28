import { initDashboardPage } from "./view/dashboardView.js";
import { initDetallePage } from "./view/detalleView.js";
import { initFavoritesPage } from "./view/favoritesView.js";

function getCurrentPage() {
    const path = window.location.pathname;

    if (path.endsWith("index.html") || path === "/" || path === "") return "dashboard";
    if (path.endsWith("detalle.html")) return "detalle";
    if (path.endsWith("favorites.html")) return "favorites";

    return "unknown";
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