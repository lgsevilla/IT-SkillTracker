/**
 * Formatea un número con separadores de miles.
 *
 * @param {number|null|undefined} value
 * @returns {string} Número formateado o "-"
 */
export function formatNumber(value) {
    if (value == null || isNaN(value)) return "-";
    return Number(value).toLocaleString("en-US");
}

/**
 * Formatea un valor numérico como moneda en EUR.
 *
 * @param {number|null|undefined} value
 * @returns {string} Texto formateado como moneda o "-"
 */
export function formatCurrency(value) {
    if (value == null || isNaN(value)) return "-";
    return Number(value).toLocaleString("en-US", {
        style: "currency",
        currency: "EUR",
        maximumFractionDigits: 0
    });
}

/**
 * Muestra el banner global de carga
 * y oculta el de error si estuviera visible.
 */
export function showLoading() {
    $("#loading-message").show();
    $("#error-message").hide();
}

/**
 * Oculta el banner global de carga.
 */
export function hideLoading() {
    $("#loading-message").hide();
}

/**
 * Muestra el banner de error con un mensaje.
 *
 * @param {string} msg Mensaje a mostrar
 */
export function showError(msg) {
    $("#error-message").text(msg).show();
}