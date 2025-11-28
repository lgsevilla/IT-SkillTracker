import { API_URL } from "../appConfig.js";
import { mapToRole } from "../model/roleModel.js";

/**
 * Obtiene todos los roles desde la API remota.
 *
 * @returns {Promise<Role[]>} Promesa que se resuelve con un array de roles.
 */
export async function getAllRoles() {
    const data = await $.ajax({
        url: API_URL,
        method: "GET",
        dataType: "json"
    });

    if (!Array.isArray(data)) {
        console.error("La respuesta de la API no es un array:", data);
        throw new Error("Formato de respuesta inválido");
    }

    return data.map(mapToRole);
}

/**
 * Obtiene un único rol por ID.
 *
 * Este método permite dos modos de funcionamiento:
 *  - Si se proporciona rolesCache, se busca en ese array (más eficiente).
 *  - Si NO se proporciona, se llama internamente a getAllRoles().
 *
 * Esto permite usar este método de forma flexible en distintas partes
 * de la aplicación, evitando peticiones innecesarias cuando ya
 * disponemos de los datos cargados.
 *
 * @param {number|string} id  ID del rol a buscar.
 * @param {Role[]=} rolesCache  (Opcional) Array de roles ya cargados.
 * @returns {Promise<Role|null>} El rol encontrado o null si no existe.
 */
export function getRoleById(id, rolesCache) {
    const numericId = Number(id);
    if (Number.isNaN(numericId)) {
        return Promise.reject(new Error("Invalid role id"));
    }

    const source = Array.isArray(rolesCache)
        ? Promise.resolve(rolesCache)
        : getAllRoles();

    return source.then(roles => {
        const role = roles.find(r => r.id === numericId);
        if (!role) {
            console.warn(`Role with ID "${id}" not found.`);
            return null;
        }
        return role;
    });
}