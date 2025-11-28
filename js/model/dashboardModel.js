/**
 * Calcula KPIs globales a partir de todas las filas (todos los roles-país-nivel).
 * @param {Role[]} roles
 * @returns {{ totalDemand: number, globalAverageSalary: number|null }}
 */
export function computeGlobalKPIs(roles) {
    let totalDemand = 0;
    let salarySum = 0;
    let salaryCount = 0;

    roles.forEach(role => {
        if (role.hasDemand) {
            totalDemand += role.demandIndex;
        }
        if (role.hasSalary) {
            salarySum += role.avgSalary;
            salaryCount++;
        }
    });

    return {
        totalDemand,
        globalAverageSalary: salaryCount > 0 ? salarySum / salaryCount : null
    };
}

/**
 * Construye una lista de resúmenes por nombre de rol.
 * Cada resumen contiene demanda total, salario medio y un id de fallback
 * para navegar al detalle (preferencia: Spain + Junior).
 *
 * @param {Role[]} roles
 * @returns {Array<{name: string, totalDemand: number, avgSalary: number|null, fallbackId: number}>}
 */
export function buildRoleSummaryList(roles) {
    const byName = new Map();

    roles.forEach(role => {
        const key = role.name || `Role #${role.id}`;
        let entry = byName.get(key);

        if (!entry) {
            entry = {
                name: key,
                totalDemand: 0,
                salarySum: 0,
                salaryCount: 0,
                fallbackId: role.id, // provisional
                hasSpainJunior: false,
                hasSpain: false
            };
            byName.set(key, entry);
        }

        // acumulamos demanda y salario
        if (role.hasDemand) {
            entry.totalDemand += role.demandIndex;
        }
        if (role.hasSalary) {
            entry.salarySum += role.avgSalary;
            entry.salaryCount++;
        }

        // lógica de fallback, preferir Spain + Junior
        if (role.country === "Spain" && role.level === "Junior") {
            entry.fallbackId = role.id;
            entry.hasSpainJunior = true;
            return;
        }

        // si aún no hay Spain+Junior, pero sí Spain, lo marcamos como candidato
        if (!entry.hasSpainJunior && role.country === "Spain") {
            if (!entry.hasSpain) {
                entry.fallbackId = role.id;
                entry.hasSpain = true;
            }
            return;
        }

    });

    const result = Array.from(byName.values()).map(entry => ({
        name: entry.name,
        totalDemand: entry.totalDemand,
        avgSalary: entry.salaryCount > 0 ? entry.salarySum / entry.salaryCount : null,
        fallbackId: entry.fallbackId
    }));

    // ordenamos por demanda total descendente
    result.sort((a, b) => (b.totalDemand || 0) - (a.totalDemand || 0));

    return result;
}

/**
 * Utilidad genérica de paginación.
 *
 * @param {Array} items
 * @param {number} page
 * @param {number} pageSize
 * @returns {{ pageItems: Array, page: number, totalPages: number, totalItems: number }}
 */
export function paginate(items, page, pageSize) {
    const totalItems = items.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

    const safePage = Math.min(Math.max(1, page), totalPages);
    const start = (safePage - 1) * pageSize;
    const end = start + pageSize;

    return {
        pageItems: items.slice(start, end),
        page: safePage,
        totalPages,
        totalItems
    };
}