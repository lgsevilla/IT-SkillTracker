import { getAllRoles } from "../service/apiService.js";
import { getFavoriteRoleIds } from "../service/favoriteService.js";
import { buildTableRow } from "./tableRow.js";
import { paginate } from "../model/dashboardModel.js";
import {
    formatNumber,
    formatCurrency,
    showLoading,
    hideLoading,
    showError
} from "./viewUtils.js";

const PAGE_SIZE = 50;

let favoriteRoles = [];
let currentPage = 1;

/**
 * Renderiza la tabla de favoritos aplicando paginación.
 * Usa el componente reutilizable buildTableRow() para que
 * la tabla tenga exactamente el mismo formato que la tabla del dashboard.
 */
function renderTable() {
    const $tbody = $("#favorites-table-body");
    $tbody.empty();

    const { pageItems, page, totalPages, totalItems } = paginate(
        favoriteRoles,
        currentPage,
        PAGE_SIZE
    );

    currentPage = page;

    if (!pageItems.length) {
        const $row = $("<tr>").append(
            $("<td>")
                .attr("colspan", 6)
                .addClass("empty-message")
                .text("No tienes roles favoritos todavía.")
        );
        $tbody.append($row);
    } else {
        pageItems.forEach(role => {
            const $tr = buildTableRow(
                role,
                formatCurrency,
                formatNumber,
                id => {
                    window.location.href = `detalle.html?id=${encodeURIComponent(
                        id
                    )}`;
                }
            );
            $tbody.append($tr);
        });
    }

    $("#favorites-pagination-info").text(
        `Página ${page} de ${totalPages} · ${totalItems} favoritos`
    );

    $("#favorites-pagination-prev").prop("disabled", page <= 1);
    $("#favorites-pagination-next").prop("disabled", page >= totalPages);
}

/**
 * Configura los listeners para la paginación de favoritos.
 */
function setupPaginationHandlers() {
    $("#favorites-pagination-prev")
        .off("click")
        .on("click", () => {
            currentPage = Math.max(1, currentPage - 1);
            renderTable();
        });

    $("#favorites-pagination-next")
        .off("click")
        .on("click", () => {
            currentPage = currentPage + 1;
            renderTable();
        });
}

/**
 * Punto de entrada de la página de favoritos.
 *
 * 1. Carga todos los roles desde el API
 * 2. Obtiene los IDs favoritos desde localStorage
 * 3. Filtra solo aquellos que coinciden
 * 4. Renderiza tabla + paginación
 */
export async function initFavoritesPage() {
    showLoading();

    try {
        const allRoles = await getAllRoles();
        const favIds = new Set(getFavoriteRoleIds());

        favoriteRoles = allRoles.filter(r => favIds.has(r.id));

        hideLoading();

        renderTable();
        setupPaginationHandlers();

    } catch (err) {
        console.error("Error loading favorites page:", err);
        hideLoading();
        showError("Error cargando tus favoritos.");
    }
}