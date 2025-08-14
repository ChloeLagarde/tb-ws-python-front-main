import * as Affichage from './Affichage_Equipment.js';
export default afficherDonneesEquipment; 

function isServiceId(name) {
    if (!name || !name.includes('-')) {
        return false;
    }
        const prefix = name.split('-')[0];
    
    if (prefix.length === 4 && /^[A-Za-z]+$/.test(prefix)) {
        return true;
    }
    
    return false;
}

export function afficherDonneesEquipment(dataToDisplay, idService){
    console.log(dataToDisplay);
    const rectangleDonnee = document.getElementById("rectangleDonnee");
    let htmlContent = {};
    
    // Vérifier d'abord si c'est un ID de service
    if (isServiceId(idService)) {
        console.log("ID de service détecté:", idService);
        htmlContent = Affichage.afficherService(dataToDisplay);
    }
    else if (idService.toLowerCase().includes("olt"))
    {
        htmlContent = Affichage.afficherOLT(dataToDisplay);
    }
    else if (idService.toLowerCase().includes("wdm"))
    {
        htmlContent = Affichage.afficherServiceWDM(dataToDisplay);
    }
    else if (idService.toLowerCase().includes("pbb"))
    {
        htmlContent = Affichage.afficherPBB(dataToDisplay);
    }

    rectangleDonnee.innerHTML = htmlContent;
}