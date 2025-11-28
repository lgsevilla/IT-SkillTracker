/**
 * Opciones disponibles para ordenar los roles.
 * Cada clave representa un criterio usado en la vista.
 *
 * - demand-desc  → mayor demanda primero
 * - salary-desc  → mayor salario medio primero
 * - name-asc     → alfabético ascendente por nombre de rol
 */
export const SORT_OPTIONS = {
    DEMAND_DESC: "demand-desc",
    SALARY_DESC: "salary-desc",
    NAME_ASC: "name-asc"
};

/**
 * Filtros por defecto aplicados al listado de roles.
 *
 * - searchText → texto libre para buscar en nombre, país y nivel
 * - sortBy     → criterio de ordenación inicial
 */
export const defaultFilters = {
    searchText: "",
    sortBy: SORT_OPTIONS.DEMAND_DESC
};


/**
 * Determina si un rol coincide con el texto de búsqueda.
 *
 * La búsqueda se realiza sobre:
 *   - nombre del rol
 *   - país
 *   - nivel
 *
 * Coincide si *cualquier parte* del texto aparece en el rol.
 *
 * @param {Role} role
 * @param {string} searchText
 * @returns {boolean} true si el rol encaja con la búsqueda
 */
function matchesSearch(role, searchText) {
    if (!searchText) return true;

    // como aguja en un pajar
    const needle = searchText.trim().toLowerCase();
    if (!needle) return true;

    const haystack = [
        role.name,
        role.country,
        role.level
    ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

    return haystack.includes(needle);
}

/**
 * Ordena un listado de roles según el criterio especificado.
 *
 * Criterios:
 * - salary-desc: salario medio descendente (fallback: demanda)
 * - name-asc: orden alfabético por nombre
 * - demand-desc: demanda descendente (fallback: salario)
 *
 * @param {Role[]} roles
 * @param {string} sortBy
 * @returns {Role[]} nueva lista ordenada (no modifica el array original)
 */
function sortRoles(roles, sortBy) {
    const sorted = [...roles];

    switch (sortBy) {
        case SORT_OPTIONS.SALARY_DESC:
            sorted.sort((a, b) => {
                const salaryDiff = (b.avgSalary || 0) - (a.avgSalary || 0);
                if (salaryDiff !== 0) return salaryDiff;
                return (b.demandIndex || 0) - (a.demandIndex || 0);
            });
            break;

        case SORT_OPTIONS.NAME_ASC:
            sorted.sort((a, b) => {
                const nameA = (a.name || "").toLowerCase();
                const nameB = (b.name || "").toLowerCase();
                if (nameA < nameB) return -1;
                if (nameA > nameB) return 1;
                return 0;
            });
            break;

        case SORT_OPTIONS.DEMAND_DESC:
        default:
            sorted.sort((a, b) => {
                const demandDiff = (b.demandIndex || 0) - (a.demandIndex || 0);
                if (demandDiff !== 0) return demandDiff;
                return (b.avgSalary || 0) - (a.avgSalary || 0);
            });
            break;
    }

    return sorted;
}


/**
 * Aplica el flujo completo:
 *   1. fusionar filtros → defaultFilters + userFilters
 *   2. filtrar roles por texto de búsqueda
 *   3. ordenar los roles resultantes
 *
 * Esto permite que cualquier vista reciba únicamente:
 *    applyFiltersAndSort(roles, { searchText: "...", sortBy: "..." })
 *
 * @param {Role[]} roles
 * @param {{searchText?: string, sortBy?: string}} filters
 * @returns {Role[]} roles filtrados y ordenados
 */
export function applyFiltersAndSort(roles, filters ={}) {
    const effectiveFilters = {
        ...defaultFilters,
        ...filters
    };

    const filtered = roles.filter(role =>
        matchesSearch(role, effectiveFilters.searchText)
    );

    return sortRoles(filtered, effectiveFilters.sortBy);
}