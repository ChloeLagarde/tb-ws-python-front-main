export function OAM(dataToDisplay) {
    let htmlContent = "";

    for (let i = 0; i < dataToDisplay.length; i++) {
        const entry = dataToDisplay[i];
        const oam = entry["oam"] || {};
        const oamLivraison = entry["Oam livraison"] || {};

        // Si Oam livraison existe
        if (oamLivraison["OAM_LIVRAISON"] !== undefined) {
            const classOAMLivraison = oamLivraison["OAM_LIVRAISON"].includes("KO") ? "surligneR" : "surligne";
            htmlContent += `<h2><strong class="${classOAMLivraison}">OAM Livraison : ${oamLivraison["OAM_LIVRAISON"]}</strong></h2>`;
        }

        // Si OAM_ADVA existe dans oam
        if (oam["OAM_ADVA"] !== undefined) {
            const classOAM = oam["OAM_ADVA"].includes("KO") ? "surligneR" : "surligne";
            htmlContent += `<h2><strong class="${classOAM}">OAM NTE : ${oam["OAM_ADVA"]}</strong></h2>`;
        }

        // Si OAM_IXEN existe dans oam
        if (oam["OAM_IXEN"] !== undefined) {
            const classOAM = oam["OAM_IXEN"].includes("KO") ? "surligneR" : "surligne";
            htmlContent += `<h2><strong class="${classOAM}">OAM NTE : ${oam["OAM_IXEN"]}</strong></h2>`;
        }
    }

    return htmlContent;
}
