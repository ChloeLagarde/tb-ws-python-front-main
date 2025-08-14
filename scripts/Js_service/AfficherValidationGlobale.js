export function ValidationGlobal(dataToDisplay) {
    const validationglobal = dataToDisplay["validationGlobal"];
    if (!validationglobal) {
        return "<p>Aucune donnée de validation disponible.</p>";
    }

    // Cas validation OK
    if (validationglobal.Validation_Globale === 1) {
        return `
            <div class="validation-ok">
                <h2>Validation Globale : <span class =carre-vert> ${validationglobal.message || "Aucun point bloquant détecté."}</carre-vert></h2>
            </div>
        `;
    }else{
        return ` `
    }

}