/**
 * Filtra la lista completa de roles y devuelve únicamente aquellos
 * cuyo nombre coincide con el del rol principal.
 *
 * Ejemplo: "Backend Developer" → devuelve todas las combinaciones
 * de país y nivel asociadas a ese nombre.
 *
 * @param {Role[]} allRoles - Lista completa de roles
 * @param {Role} mainRole - El rol principal cargado desde la vista detalle
 * @returns {Role[]} Lista de roles cuyo nombre coincide con mainRole.name
 */
export function filterBaseRoles(allRoles, mainRole) {
    return allRoles.filter(r => r.name === mainRole.name);
}

/**
 * Devuelve un listado de países disponibles para las variantes del rol.
 *
 * @param {Role[]} baseRoles - Roles filtrados por nombre
 * @returns {string[]} Lista de países únicos ordenados alfabéticamente
 */
export function getCountriesForBaseRole(baseRoles) {
    return [...new Set(baseRoles.map(r => r.country))].sort();
}

/**
 * Devuelve los niveles disponibles para un país concreto dentro del mismo rol.
 * Si no se proporciona país, devuelve todos los niveles del rol.
 *
 * @param {Role[]} baseRoles - Variantes del rol (mismo nombre)
 * @param {string|null} country - País seleccionado, o null para incluir todos
 * @returns {string[]} Lista de niveles únicos ordenados alfabéticamente
 */
export function getLevelsForCountry(baseRoles, country) {
    return [...new Set(
        baseRoles
            .filter(r => !country || r.country === country)
            .map(r => r.level)
    )].sort();
}


/**
 * Busca la versión del rol que mejor coincida con los filtros:
 * 1. Coincidencia exacta (country + level)
 * 2. Si no existe: coincidencia por país
 * 3. Si no existe: coincidencia por nivel
 * 4. Último recurso: primer registro de baseRoles
 *
 * @param {Role[]} baseRoles
 * @param {string|null} country
 * @param {string|null} level
 * @returns {Role|null} La variante más representativa del rol
 */
export function findRoleByCountryLevel(baseRoles, country, level) {
    let role = baseRoles.find(r => r.country === country && r.level === level);
    if (role) return role;

    if (country) {
        role = baseRoles.find(r => r.country === country);
        if (role) return role;
    }

    if (level) {
        role = baseRoles.find(r => r.level === level);
        if (role) return role;
    }

    return baseRoles[0] || null;
}

/**
 * Obtiene los nombres únicos de roles dentro de toda la lista,
 * útil para la funcionalidad "Cambiar rol".
 *
 * Devuelve una lista de objetos Role representativos: uno por nombre.
 *
 * @param {Role[]} roles
 * @returns {Role[]} Lista de roles distintos por nombre
 */
export function getUniqueRoleNames(roles) {
    return [...new Map(roles.map(r => [r.name, r])).values()]
        .sort((a, b) => a.name.localeCompare(b.name));
}


/**
 * Devuelve los países disponibles para un nombre de rol concreto.
 * Se usa en la sección de comparación de la vista detalle.
 *
 * @param {Role[]} allRoles
 * @param {string} name - Nombre de rol seleccionado
 * @returns {string[]} Países únicos ordenados alfabéticamente
 */
export function getCountriesForRoleName(allRoles, name) {
    return [...new Set(allRoles
        .filter(r => r.name === name)
        .map(r => r.country)
    )].sort();
}

/**
 * Devuelve los niveles disponibles para un rol y país concretos,
 * para completar el tercer selector de comparación en la vista detalle.
 *
 * @param {Role[]} allRoles
 * @param {string} name
 * @param {string} country
 * @returns {string[]} Niveles únicos ordenados alfabéticamente
 */
export function getLevelsForRoleCountry(allRoles, name, country) {
    return [...new Set(allRoles
        .filter(r => r.name === name && r.country === country)
        .map(r => r.level)
    )].sort();
}