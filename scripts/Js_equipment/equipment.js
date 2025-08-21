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

// Fonction pour être appelée après l'affichage du contenu avec accordéons
function setupAccordionDisplay(data, container) {
    let htmlContent;
    
    // Déterminer le type d'affichage basé sur les données
    if (data.equipments && Array.isArray(data.equipments)) {
        htmlContent = Affichage.afficherServiceWithAccordion(data);
    } else if (data.equipment_info || data.ports) {
        htmlContent = Affichage.afficherPBBWithAccordion(data);
    } else {
        htmlContent = "<p>Format de données non reconnu</p>";
    }
    
    // Injecter le contenu
    if (typeof container === 'string') {
        document.getElementById(container).innerHTML = htmlContent;
    } else {
        container.innerHTML = htmlContent;
    }
    
    // Initialiser les accordéons
    setTimeout(() => {
        initializeAccordions();
    }, 100);
    
    container.style.display = 'block';
    return htmlContent;
}

// Fonction utilitaire pour initialiser les accordéons (copie de celle dans Affichage_Equipment.js)
function initializeAccordions() {
    // Accordéon principal pour les équipements
    $(".equipment-accordion").accordion({
        collapsible: true,
        active: false,
        animate: 300,
        heightStyle: "content",
        icons: {
            header: "ui-icon-circle-arrow-e",
            activeHeader: "ui-icon-circle-arrow-s"
        }
    });

    // Accordéon pour les ports
    $(".ports-accordion").accordion({
        collapsible: true,
        active: false,
        animate: 200,
        heightStyle: "content",
        icons: {
            header: "ui-icon-triangle-1-e",
            activeHeader: "ui-icon-triangle-1-s"
        }
    });

    // Accordéon pour les LAG et entités mères
    $(".lag-accordion, .entity-accordion").accordion({
        collapsible: true,
        active: false,
        animate: 250,
        heightStyle: "content",
        icons: {
            header: "ui-icon-plus",
            activeHeader: "ui-icon-minus"
        }
    });
}

export function afficherDonneesEquipment(dataToDisplay, idService){
    console.log('afficherDonneesEquipment appelée avec:', dataToDisplay, idService);
    const rectangleDonnee = document.getElementById("rectangleDonnee");
    
    if (!rectangleDonnee) {
        console.error("L'élément rectangleDonnee est introuvable dans le DOM.");
        return;
    }
    
    // Vérifier d'abord si c'est un ID de service
    if (isServiceId(idService)) {
        console.log("ID de service détecté:", idService);
        // Utiliser l'affichage avec accordéons pour les services
        setupAccordionDisplay(dataToDisplay, rectangleDonnee);
    }
    else if (idService.toLowerCase().includes("olt"))
    {
        // Garder l'affichage classique pour OLT
        Affichage.afficherOLT(dataToDisplay);
    }
    else if (idService.toLowerCase().includes("wdm"))
    {
        // Garder l'affichage classique pour WDM  
        const htmlContent = Affichage.afficherServiceWDM(dataToDisplay);
        rectangleDonnee.innerHTML = htmlContent;
        rectangleDonnee.style.display = 'block';
    }
    else if (idService.toLowerCase().includes("pbb"))
    {
        // Utiliser l'affichage avec accordéons pour PBB
        setupAccordionDisplay(dataToDisplay, rectangleDonnee);
    }
    else 
    {
        // Pour tous les autres cas, utiliser l'affichage service avec accordéons
        console.log("Utilisation de l'affichage service avec accordéons pour:", idService);
        setupAccordionDisplay(dataToDisplay, rectangleDonnee);
    }
}