import {
    isFavoriteRoleId,
    toggleFavoriteRoleId
} from "../service/favoriteService.js";

/**
 * Construye una fila de tabla reutilizable.
 *
 * @param {Role} role
 * @param {(value:number|null)=>string} formatCurrency
 * @param {(value:number|null)=>string} formatNumber
 * @param {(id:number)=>void} onRowClick   Callback al hacer clic en la fila
 * @returns {JQuery<HTMLElement>}
 */
export function buildTableRow(role, formatCurrency, formatNumber, onRowClick) {
    const $tr = $("<tr>")
        .addClass("table-row")
        .attr("data-id", role.id);

    // Star para favorites
    const isFav = isFavoriteRoleId(role.id);

    const $favBtn = $("<button>")
        .addClass("favorite-toggle")
        .attr("type", "button")
        .attr(
            "aria-label",
            isFav ? "Quitar de favoritos" : "Añadir a favoritos"
        )
        .text(isFav ? "★" : "☆");

    // Evitar que el click en la estrella dispare el click de la fila
    $favBtn.on("click", ev => {
        ev.stopPropagation();
        toggleFavoriteRoleId(role.id);

        const nowFav = isFavoriteRoleId(role.id);
        $favBtn
            .text(nowFav ? "★" : "☆")
            .attr(
                "aria-label",
                nowFav ? "Quitar de favoritos" : "Añadir a favoritos"
            );
    });

    $tr.append(
        $("<td>").addClass("favorite-cell").append($favBtn)
    );

    // columnas
    $tr.append($("<td>").text(role.name || `Role #${role.id}`));
    $tr.append($("<td>").text(role.country || "—"));
    $tr.append($("<td>").text(role.level || "—"));
    $tr.append($("<td>").text(formatCurrency(role.avgSalary)));
    $tr.append($("<td>").text(formatNumber(role.demandIndex)));

    // event para ir a detalle
    $tr.on("click", () => onRowClick(role.id));

    return $tr;
}