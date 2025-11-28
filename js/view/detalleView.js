// js/view/detalleView.js

import { getAllRoles, getRoleById } from "../service/apiService.js";
import {
    filterBaseRoles,
    getCountriesForBaseRole,
    getLevelsForCountry,
    findRoleByCountryLevel,
    getUniqueRoleNames,
    getCountriesForRoleName,
    getLevelsForRoleCountry
} from "../model/detalleModel.js";

/** @global
 * @type {typeof import("chart.js")}
 */
const Chart = window.Chart;

// --- Module-level state ---
let allRoles = [];
let baseRoles = [];

/**
 * @typedef {Object} ChartInstance
 * @property {() => void} destroy
 */

/** @type {ChartInstance|null} */
let salaryChart = null;

/** @type {Role|null} */
let currentRole = null;  // Currently displayed role (country+level)


/**
 * Devuelve el valor de un parámetro de la query string.
 * @param {string} name Nombre del parámetro
 * @returns {string|null}
 */
function getQueryParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
}

/**
 * Formatea un número con separador de miles.
 * @param {number|null|undefined} value
 * @returns {string}
 */
function formatNumber(value) {
    if (value == null || isNaN(value)) return "-";
    return Number(value).toLocaleString("en-US");
}

/**
 * Formatea una cantidad como moneda en EUR.
 * @param {number|null|undefined} value
 * @returns {string}
 */
function formatCurrency(value) {
    if (value == null || isNaN(value)) return "-";
    return Number(value).toLocaleString("en-US", {
        style: "currency",
        currency: "EUR",
        maximumFractionDigits: 0
    });
}

function showLoading() { $("#loading-message").show(); }
function hideLoading() { $("#loading-message").hide(); }
function showError(msg) { $("#error-message").text(msg).show(); }


/**
 * Muestra el título, país, nivel y KPIs del rol seleccionado.
 */
function renderRoleHeader(role) {
    if (!role) return;
    currentRole = role;

    const title = role.name || `Role #${role.id}`;
    const meta = [role.country, role.level].filter(Boolean).join(" · ") || "—";

    $("#role-title").text(title);
    $("#role-meta").text(meta);

    const demandText = role.hasDemand ? formatNumber(role.demandIndex) : "N/A";
    $("#kpi-role-demand").text(demandText);
    $("#kpi-role-salary").text(role.getFormattedAvgSalary());

    const yearsCount = Array.isArray(role.salaryHistory)
        ? role.salaryHistory.length
        : 0;
    $("#kpi-role-years").text(formatNumber(yearsCount));
}

/**
 * Construye el dataset para un rol en el gráfico de salario.
 * @param {Role} role
 * @param {string} color
 * @returns {object}
 */
function buildSalaryDataset(role, color) {
    const sortedHistory = [...(role.salaryHistory || [])].sort(
        (a, b) => a.year - b.year
    );

    return {
        label: `${role.name} (${role.country}, ${role.level})`,
        data: sortedHistory.map(entry => ({
            x: entry.year,
            y: entry.salary
        })),
        borderColor: color,
        backgroundColor: color,
        tension: 0.2
    };
}

/**
 * Renderiza el gráfico principal y el gráfico de comparación.
 * Destruye el anterior si existe.
 */
function renderSalaryChart(mainRole, compareRole = null) {
    const ctx = document.getElementById("salary-chart");
    if (!ctx) return;

    if (salaryChart) {
        salaryChart.destroy();
        salaryChart = null;
    }

    const datasets = [buildSalaryDataset(mainRole, "rgba(54, 162, 235, 1)")];

    if (compareRole) {
        datasets.push(
            buildSalaryDataset(compareRole, "rgba(255, 159, 64, 1)")
        );
    }

    salaryChart = new Chart(ctx, {
        type: "line",
        data: { datasets },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            parsing: false,
            scales: {
                x: {
                    type: "linear",
                    title: { display: true, text: "Año" },
                    ticks: { precision: 0 }
                },
                y: {
                    title: { display: true, text: "Salario (EUR)" }
                }
            },
            plugins: {
                legend: { display: true },
                tooltip: {
                    callbacks: {
                        label: context => {
                            const year = context.parsed.x;
                            const salary = context.parsed.y;
                            return `${year}: ${formatCurrency(salary)}`;
                        }
                    }
                }
            }
        }
    });
}

/**
 * Rellena los selects de país y nivel basándose en baseRoles.
 */
function populateMainSelects(initialRole) {
    const $country = $("#main-country-select");
    const $level = $("#main-level-select");

    $country.empty();
    $level.empty();

    const countries = getCountriesForBaseRole(baseRoles);
    const initialCountry = initialRole.country || countries[0] || "";

    countries.forEach(c => {
        const $opt = $("<option>").val(c).text(c);
        if (c === initialCountry) $opt.prop("selected", true);
        $country.append($opt);
    });

    const levels = getLevelsForCountry(baseRoles, initialCountry);
    const initialLevel =
        initialRole.level && levels.includes(initialRole.level)
            ? initialRole.level
            : levels[0] || "";

    levels.forEach(lvl => {
        const $opt = $("<option>").val(lvl).text(lvl);
        if (lvl === initialLevel) $opt.prop("selected", true);
        $level.append($opt);
    });

    const roleToShow = findRoleByCountryLevel(
        baseRoles,
        initialCountry,
        initialLevel
    );

    if (roleToShow) {
        renderRoleHeader(roleToShow);
        renderSalaryChart(roleToShow, null);
    }

    setupMainSelectHandlers();
}

/**
 * Listeners para actualizar país/nivel.
 */
function setupMainSelectHandlers() {
    const $country = $("#main-country-select");
    const $level = $("#main-level-select");

    $country.off("change").on("change", () => {
        const selectedCountry = $country.val();

        const levels = getLevelsForCountry(baseRoles, selectedCountry);
        $level.empty();

        const firstLevel = levels[0] || "";

        levels.forEach(lvl => {
            const $opt = $("<option>").val(lvl).text(lvl);
            if (lvl === firstLevel) $opt.prop("selected", true);
            $level.append($opt);
        });

        const role = findRoleByCountryLevel(baseRoles, selectedCountry, firstLevel);
        if (role) {
            renderRoleHeader(role);
            renderSalaryChart(role, null);
        }
    });

    $level.off("change").on("change", () => {
        const selectedCountry = $country.val();
        const selectedLevel = $level.val();

        const role = findRoleByCountryLevel(
            baseRoles,
            selectedCountry,
            selectedLevel
        );

        if (role) {
            renderRoleHeader(role);
            renderSalaryChart(role, null);
        }
    });
}

/**
 * Selector que cambia el nombre del rol
 */
function populateChangeRoleSelect(mainRole) {
    const $select = $("#change-role-select");
    if (!$select.length) return;

    $select.empty();
    $select.append(
        $("<option>").val("").text("Selecciona un rol…")
    );

    const uniqueRoles = getUniqueRoleNames(allRoles);

    uniqueRoles.forEach(role => {
        const $opt = $("<option>")
            .val(role.name)
            .text(role.name);

        if (role.name === mainRole.name) {
            $opt.prop("selected", true);
        }

        $select.append($opt);
    });
}

function setupChangeRoleHandler() {
    $("#change-role-select").off("change").on("change", function () {
        const roleName = $(this).val();
        if (!roleName) return;

        const target = allRoles.find(r => r.name === roleName);
        if (!target) return;

        window.location.href = `detalle.html?id=${encodeURIComponent(target.id)}`;
    });
}


/**
 * Comparadores entre roles, de Rol, país luego nivel
 */
function populateCompareRoleName(mainRole) {
    const $name = $("#compare-role-name");
    const $country = $("#compare-country-select");
    const $level = $("#compare-level-select");

    $name.empty();
    $name.append($("<option>").val("").text("Sin comparación"));

    const uniqueRoles = getUniqueRoleNames(allRoles);
    uniqueRoles.forEach(role => {
        const $opt = $("<option>").val(role.name).text(role.name);
        $name.append($opt);
    });

    const same = $name.find(`option[value="${mainRole.name}"]`);
    if (same.length) same.prop("selected", true);

    $country
        .empty()
        .append($("<option>").val("").text("Selecciona un rol primero"))
        .prop("disabled", true);

    $level
        .empty()
        .append($("<option>").val("").text("Selecciona país primero"))
        .prop("disabled", true);
}

function populateCompareCountry(roleName) {
    const $country = $("#compare-country-select");
    const $level = $("#compare-level-select");

    $country.empty();
    $level
        .empty()
        .append($("<option>").val("").text("Selecciona país primero"))
        .prop("disabled", true);

    if (!roleName) {
        $country
            .append($("<option>").val("").text("Selecciona un rol primero"))
            .prop("disabled", true);
        return;
    }

    const countries = getCountriesForRoleName(allRoles, roleName);

    if (!countries.length) {
        $country.append($("<option>").val("").text("Sin datos")).prop("disabled", true);
        return;
    }

    $country.prop("disabled", false);
    $country.append($("<option>").val("").text("Selecciona país…"));

    countries.forEach(c =>
        $country.append($("<option>").val(c).text(c))
    );
}

function populateCompareLevel(roleName, country) {
    const $level = $("#compare-level-select");
    $level.empty();

    if (!roleName || !country) {
        $level.append($("<option>").val("").text("Selecciona país primero"))
            .prop("disabled", true);
        return;
    }

    const levels = getLevelsForRoleCountry(allRoles, roleName, country);

    if (!levels.length) {
        $level.append($("<option>").val("").text("Sin datos"))
            .prop("disabled", true);
        return;
    }

    $level.prop("disabled", false);
    $level.append($("<option>").val("").text("Selecciona nivel…"));

    levels.forEach(l =>
        $level.append($("<option>").val(l).text(l))
    );
}

/**
 * Actualiza el gráfico de comparación solo cuando los 3 selects están completos.
 * @param {Role} mainRole
 */
function updateCompareChart(mainRole) {
    const roleName = $("#compare-role-name").val();
    const country = $("#compare-country-select").val();
    const level = $("#compare-level-select").val();

    const base = currentRole || mainRole;

    if (!roleName || !country || !level) {
        renderSalaryChart(base, null);
        return;
    }

    const compare = allRoles.find(
        r => r.name === roleName && r.country === country && r.level === level
    );

    if (!compare) {
        renderSalaryChart(base, null);
        return;
    }

    if (
        compare.name === base.name &&
        compare.country === base.country &&
        compare.level === base.level
    ) {
        renderSalaryChart(base, null);
        return;
    }

    renderSalaryChart(base, compare);
}

function setupCompareHandlers(mainRole) {
    $("#compare-role-name").off("change").on("change", function () {
        const name = $(this).val();
        populateCompareCountry(name);
        renderSalaryChart(currentRole || mainRole, null);
    });

    $("#compare-country-select").off("change").on("change", function () {
        const name = $("#compare-role-name").val();
        const country = $(this).val();
        populateCompareLevel(name, country);
        renderSalaryChart(currentRole || mainRole, null);
    });

    $("#compare-level-select").off("change").on("change", function () {
        updateCompareChart(mainRole);
    });
}

/**
 * Entrada principal de la página de detalle.
 *
 * 1. Lee el parámetro ?id
 * 2. Usa getRoleById(id) para obtener el rol principal (requerido por el ejercicio)
 * 3. Usa getAllRoles() para obtener todas las combinaciones país+nivel
 * 4. Construye baseRoles (roles con el mismo nombre)
 * 5. Renderiza encabezado, gráfico, selects y comparación
 */
export async function initDetallePage() {
    const idParam = getQueryParam("id");
    const id = Number(idParam);

    if (!idParam || Number.isNaN(id)) {
        showError("El identificador de rol no es válido.");
        return;
    }

    showLoading();

    try {
        const [all, mainRole] = await Promise.all([
            getAllRoles(),
            getRoleById(id)
        ]);

        allRoles = all;

        if (!mainRole) {
            hideLoading();
            showError("No se ha encontrado el rol solicitado.");
            return;
        }

        baseRoles = filterBaseRoles(allRoles, mainRole);

        hideLoading();

        renderRoleHeader(mainRole);
        renderSalaryChart(mainRole, null);

        populateMainSelects(mainRole);

        populateChangeRoleSelect(mainRole);
        setupChangeRoleHandler();

        populateCompareRoleName(mainRole);
        setupCompareHandlers(mainRole);

    } catch (err) {
        console.error("Error loading detalle page:", err);
        hideLoading();
        showError("Error cargando el rol. Inténtalo de nuevo más tarde.");
    }
}