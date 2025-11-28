/**
 * Clave usada en localStorage para guardar los IDs favoritos.
 * Guardamos un array de números (IDs de roles).
 */
const STORAGE_KEY = "skilltrack.favoriteRoleIds";

/**
 * Lee desde localStorage y devuelve un array de IDs favoritos.
 *
 * - Si no existe el valor → devuelve []
 * - Si existe pero no es un array válido → devuelve []
 * - Convierte todos los elementos a número
 *
 * @returns {number[]} Lista de IDs marcados como favoritos
 */
function loadFavoriteIds() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        // Ensure numeric
        return parsed.map(id => Number(id)).filter(id => !Number.isNaN(id));
    } catch (e) {
        console.warn("Error reading favorites from localStorage:", e);
        return [];
    }
}

/**
 * Guarda en localStorage un array de IDs favoritos.
 * - Elimina duplicados
 * - Fuerza conversión a número
 *
 * @param {number[]} ids
 */
function saveFavoriteIds(ids) {
    try {
        const unique = Array.from(new Set(ids.map(id => Number(id))));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(unique));
    } catch (e) {
        console.warn("Error saving favorites to localStorage:", e);
    }
}

/**
 * Devuelve la lista completa de IDs favoritos.
 *
 * @returns {number[]}
 */
export function getFavoriteRoleIds() {
    return loadFavoriteIds();
}

/**
 * Indica si un rol concreto está marcado como favorito.
 *
 * @param {number|string} roleId
 * @returns {boolean}
 */
export function isFavoriteRoleId(roleId) {
    const idNum = Number(roleId);
    if (Number.isNaN(idNum)) return false;
    const ids = loadFavoriteIds();
    return ids.includes(idNum);
}

/**
 * Alterna el estado de favorito de un rol:
 * - Si está marcado → lo desmarca
 * - Si no lo está → lo marca
 *
 * @param {number|string} roleId
 */
export function toggleFavoriteRoleId(roleId) {
    const idNum = Number(roleId);
    if (Number.isNaN(idNum)) return;

    const ids = loadFavoriteIds();
    const idx = ids.indexOf(idNum);

    if (idx >= 0) {
        ids.splice(idx, 1);
    } else {
        ids.push(idNum);
    }

    saveFavoriteIds(ids);
}