/**
 * Modelo de dominio para una fila de datos de rol
 * (un rol concreto para un país + nivel).
 */
export class Role {
    /**
     * @param {Object} params
     * @param {number} params.id
     * @param {string} params.name
     * @param {string} params.country
     * @param {string} params.level
     * @param {number|null} params.avgSalary
     * @param {number|null} params.demandIndex
     * @param {Array<{year: number, salary: number}>} [params.salaryHistory]
     */
    constructor({
                    id,
                    name,
                    country,
                    level,
                    avgSalary,
                    demandIndex,
                    salaryHistory = []
                }) {
        this.id = Number(id);
        this.name = name || "";
        this.country = country || "";
        this.level = level || "";
        this.avgSalary = avgSalary != null ? Number(avgSalary) : null;
        this.demandIndex = demandIndex != null ? Number(demandIndex) : null;
        this.salaryHistory = Array.isArray(salaryHistory)
            ? salaryHistory.map(entry => ({
                year: Number(entry.year),
                salary: Number(entry.salary)
            }))
            : [];
    }

    /** ¿Tiene salario válido? */
    get hasSalary() {
        return typeof this.avgSalary === "number" && !Number.isNaN(this.avgSalary);
    }

    /** ¿Tiene índice de demanda válido? */
    get hasDemand() {
        return typeof this.demandIndex === "number" && !Number.isNaN(this.demandIndex);
    }

    /**
     * Devuelve el salario medio formateado como texto “bonito”
     * para mostrar en la UI. Si no hay salario, devuelve "N/A".
     *
     * @returns {string}
     */
    getFormattedAvgSalary() {
        if (!this.hasSalary) return "N/A";

        return this.avgSalary.toLocaleString("en-US", {
            style: "currency",
            currency: "EUR",
            maximumFractionDigits: 0
        });
    }
}

/**
 * Adapta un objeto plano recibido de la API a una instancia de Role.
 *
 * @param {Object} dto
 * @returns {Role}
 */
export function mapToRole(dto) {
    return new Role({
        id: dto.id,
        name: dto.name,
        country: dto.country,
        level: dto.level,
        avgSalary: dto.avgSalary,
        demandIndex: dto.demandIndex,
        salaryHistory: dto.salaryHistory
    });
}