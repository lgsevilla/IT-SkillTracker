/**
 * Vista principal del dashboard (index.html).
 *
 * Responsabilidades:
 *  - Cargar todos los roles desde el servicio de API.
 *  - Calcular y mostrar los KPIs globales.
 *  - Renderizar las tarjetas agregadas por rol (todas las combinaciones país+nivel).
 *  - Renderizar la tabla completa de roles (con paginación).
 *  - Aplicar filtros en tiempo real (búsqueda + ordenación).
 *  - Mantener el estado de página y filtros.
 */

import { getAllRoles } from "../service/apiService.js";
import { computeGlobalKPIs, buildRoleSummaryList, paginate } from "../model/dashboardModel.js";
import { applyFiltersAndSort, defaultFilters } from "../model/filtersModel.js";
import {
    formatNumber,
    formatCurrency,
    showLoading,
    hideLoading,
    showError
} from "./viewUtils.js";
import { buildTableRow } from "./tableRow.js";

const PAGE_SIZE = 50;

let allRoles = [];
let roleSummaries = [];
let currentPage = 1;

// Estado de filtros para la tabla
let tableFilters = { ...defaultFilters };
let filteredRoles = [];

/**
 * Muestra la demanda total y salario medio global en la parte superior.
 */
function renderGlobalKPIs() {
    const kpis = computeGlobalKPIs(allRoles);

    $("#kpi-global-demand").text(formatNumber(kpis.totalDemand));
    $("#kpi-global-salary").text(
        kpis.globalAverageSalary == null
            ? "-"
            : formatCurrency(kpis.globalAverageSalary)
    );
}

/**
 * Renderiza las tarjetas de "Roles más demandados".
 * Cada tarjeta corresponde a un nombre de rol e incluye:
 *  - Demanda total
 *  - Salario medio
 *  - Enlace al detalle (fallback Spain Junior o la primera aparición)
 */
function renderRoleCards() {
    const $grid = $("#roles-grid");
    $grid.empty();

    if (!roleSummaries.length) {
        $grid.append(
            $("<p>").addClass("empty-message").text("No se han encontrado roles.")
        );
        return;
    }

    roleSummaries.forEach(summary => {
        const $card = $("<article>")
            .addClass("role-card")
            .attr("data-role-id", summary.fallbackId);

        const $title = $("<h3>")
            .addClass("role-title")
            .text(summary.name);

        const demandText = `Demanda total: ${formatNumber(summary.totalDemand)}`;
        const salaryText = `Salario medio: ${
            summary.avgSalary == null ? "N/A" : formatCurrency(summary.avgSalary)
        }`;

        const $meta = $("<p>")
            .addClass("role-meta")
            .text(`${demandText} · ${salaryText}`);

        $card.append($title, $meta);

        $card.on("click", () => {
            window.location.href = `detalle.html?id=${encodeURIComponent(
                summary.fallbackId
            )}`;
        });

        $grid.append($card);
    });
}

/**
 * Renderiza la tabla completa:
 *  - Usa paginación
 *  - Usa filtros (búsqueda + orden)
 *  - Usa un componente externo buildTableRow para generar filas
 */
function renderTable() {
    const $tbody = $("#roles-table-body");
    $tbody.empty();

    const source = filteredRoles.length ? filteredRoles : allRoles;

    const { pageItems, page, totalPages, totalItems } = paginate(
        source,
        currentPage,
        PAGE_SIZE
    );

    currentPage = page;

    if (!pageItems.length) {
        $tbody.append(
            $("<tr>").append(
                $("<td>")
                    .attr("colspan", 6)
                    .addClass("empty-message")
                    .text("No hay datos para mostrar.")
            )
        );
        return;
    }

    pageItems.forEach(role => {
        const $row = buildTableRow(
            role,
            formatCurrency,
            formatNumber,
            (id) => {
                window.location.href = `detalle.html?id=${encodeURIComponent(id)}`;
            }
        );
        $tbody.append($row);
    });

    $("#pagination-info").text(
        `Página ${page} de ${totalPages} · ${totalItems} registros`
    );

    $("#pagination-prev").prop("disabled", page <= 1);
    $("#pagination-next").prop("disabled", page >= totalPages);
}

// Eventos de paginas
function setupPaginationHandlers() {
    $("#pagination-prev")
        .off("click")
        .on("click", () => {
            currentPage = Math.max(1, currentPage - 1);
            renderTable();
        });

    $("#pagination-next")
        .off("click")
        .on("click", () => {
            currentPage = currentPage + 1;
            renderTable();
        });
}

// Eventos de filtros
function setupFilterHandlers() {
    const $search = $("#filter-search");
    const $sort = $("#filter-sort");

    if ($search.length) {
        $search.on("input", () => {
            tableFilters.searchText = String($search.val()).trim();
            currentPage = 1;
            filteredRoles = applyFiltersAndSort(allRoles, tableFilters);
            renderTable();
        });
    }

    if ($sort.length) {
        $sort.val(tableFilters.sortBy);

        $sort.on("change", () => {
            tableFilters.sortBy = $sort.val();
            currentPage = 1;
            filteredRoles = applyFiltersAndSort(allRoles, tableFilters);
            renderTable();
        });
    }
}

/**
 * Punto de entrada de la vista Dashboard.
 *  - Carga datos desde la API
 *  - Prepara KPIs, cards, tabla y eventos
 */
export async function initDashboardPage() {
    showLoading();

    try {
        allRoles = await getAllRoles();

        hideLoading();

        roleSummaries = buildRoleSummaryList(allRoles);
        filteredRoles = applyFiltersAndSort(allRoles, tableFilters);

        renderGlobalKPIs();
        renderRoleCards();
        renderTable();

        setupPaginationHandlers();
        setupFilterHandlers();

    } catch (err) {
        console.error("Error loading dashboard:", err);
        hideLoading();
        showError("Error cargando los roles. Inténtalo de nuevo más tarde.");
    }
}