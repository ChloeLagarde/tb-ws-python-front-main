import * as Affichage from './Affichage_Service.js';
import { AfficherService } from './Affichage_Service.js';
import {ValidationGlobal} from'./AfficherValidationGlobale.js'
export default afficherDonneesService;

function afficherDonneesService(dataToDisplay, input) {
    const rectangleDonnee = document.getElementById("rectangleDonnee");
    rectangleDonnee.innerHTML = "";

    if (!dataToDisplay || (Array.isArray(dataToDisplay) && dataToDisplay.length === 0)) {
        rectangleDonnee.innerHTML = "<div>Aucune donnée à afficher.</div>";
        return;
    }

    // Initialisation du contenu HTML par section
    const htmlContent = {
        VALIDATION: "",
        PING: "",
        OAM: "",
        NTE: "",
        ACCESS: "",
        Data: ""
    };

    // On récupère la validation globale depuis le premier élément du tableau, si existant
    let validationSource = null;
    if (Array.isArray(dataToDisplay) && dataToDisplay.length > 0 && dataToDisplay[0].validationGlobal) {
        validationSource = dataToDisplay[0];
    } else if (dataToDisplay.validationGlobal) {
        validationSource = dataToDisplay;
    }

    // Calcul de la Validation Globale
    if (validationSource) {
        htmlContent.VALIDATION = ValidationGlobal(validationSource);
    }

    if (input.toUpperCase().includes("OSEN") || input.toUpperCase().includes("XGSP")) {
        const afficherService = new AfficherService(dataToDisplay);
        htmlContent.NTE += afficherService.getOSEN_XGSP();
    }

    if (input.toUpperCase().includes("SDSL")) {
        const afficherService = new AfficherService(dataToDisplay);
        htmlContent.NTE += afficherService.getSDSL();
    }

    const equipmentList = [];

    if (
        input.includes("FTTH") ||
        input.includes("FTTHPRO") ||
        input.includes("FTTHNCS") ||
        input.includes("COVP")
    ) {
        const afficherService = new AfficherService(dataToDisplay);
        if (input.includes("FTTHNCS") || input.includes("COVP")) {
            htmlContent.NTE += afficherService.getFTTHNCS();
        } else {
            console.log("ON RENTRE DANS LE FTTH");
            htmlContent.NTE += afficherService.getFTTH();
        }
    } else {
        if (input.includes("IXEN")) {
            processIxen(dataToDisplay, htmlContent);
        } else {

            if (Array.isArray(dataToDisplay)) {
                dataToDisplay.forEach(item => processItem(item, equipmentList));
            } else {
                processItem(dataToDisplay, equipmentList);
            }

            const uniqueEquipmentList = [...new Set(equipmentList.filter(Boolean))];
            afficherEquipementsParNTE(uniqueEquipmentList, dataToDisplay, htmlContent, input);
        }
    }

    // Toujours afficher Validation en premier, puis les autres blocs
    rectangleDonnee.innerHTML =
        htmlContent.VALIDATION +
        htmlContent.PING +
        htmlContent.OAM +
        htmlContent.NTE +
        htmlContent.ACCESS +
        htmlContent.Data;
}


function afficherEquipementsParNTE(equipmentList, dataToDisplay, htmlContent, input) {
    const equipmentGroups = {
        nte: [],
        access: [],
        others: [],
        portDeLivraison: []
    };

    // Organisation des équipements par groupes
    equipmentList.forEach(equipmentName => {
        if (!equipmentName) return;

        const items = dataToDisplay.filter(
            item => item['equipment name']?.toLowerCase() === equipmentName.toLowerCase()
        );
        if (!items.length) return;

        items.forEach(item => {
            const snmpInfo = item['snmp info'];
            const description = snmpInfo?.description;

            if (input.includes("IXEN") && description?.includes("interface-racco-vers-nte:")) {
                const NTERacco = description.split(":")[1]?.trim();
                if (NTERacco === equipmentName) {
                    equipmentGroups.nte.push({ equipmentName, item });
                } else {
                    const match = description.match(/interface-racco-vers-nte:([^ ]+)/);
                    if (match) {
                        const id = match[1];
                        equipmentGroups.access.push({ equipmentName, id, item });
                    }
                }
            } else if (equipmentName.startsWith("nte") || equipmentName.startsWith("nce")) {
                equipmentGroups.nte.push({ equipmentName, item });
            } else if (item["type acces"]?.includes("Port de Livraison")) {
                equipmentGroups.portDeLivraison.push({ equipmentName, item });
            } else {
                equipmentGroups.others.push({ equipmentName, item });
            }
        });
    });

    // Affichage par groupes
    afficherGroupesEquipements(equipmentGroups, htmlContent, dataToDisplay);
}

function afficherGroupesEquipements(equipmentGroups, htmlContent, dataToDisplay) {
    // Affichage des équipements NTE
    equipmentGroups.nte.forEach(({ equipmentName, item }) => {
        processNTE(item, htmlContent, dataToDisplay);

        // Liaison avec les équipements ACCESS
        equipmentGroups.access.forEach(({ equipmentName: linkedName, item: linkedItem, id }) => {
            if (normalize(id) === normalize(equipmentName)) {
                processOtherEquipment(linkedItem, htmlContent, dataToDisplay);
            }
        });
    });

    // Affichage des autres équipements
    equipmentGroups.others.forEach(({ item }) => {
        processOtherEquipment(item, htmlContent, dataToDisplay);
    });

    // Affichage des équipements "Port de Livraison"
    equipmentGroups.portDeLivraison.forEach(({ item }) => {
        processOtherEquipment(item, htmlContent, dataToDisplay);
    });
}

function processItem(item, equipmentList) {
    const equipmentName = item['equipment name']?.toLowerCase();
    if (equipmentName) {
        equipmentList.push(equipmentName);
    }
}

function processNTE(item, htmlContent, dataToDisplay) {
  const afficherService = AfficherService.fromDataToDisplay(dataToDisplay, item);
  const ipFull = item["ip"];                      // ex. "10.165.217.159 time=26.9"
  const ipOnly = ipFull.split(/\s+/)[0];         // ne garder que "10.165.217.159"
  const equipmentName = item["equipment name"];
  const equipmentInfo = item["equipment_info"];
  const snmpInfo = item["snmp info"];
  const name = (snmpInfo["name"] || "").toLowerCase();
  if  (snmpInfo["admin status"] === "Null" && snmpInfo["oper status"] === "Null" ){
    return " "
  }else{
    htmlContent.NTE +=
    `<h1>PING OK du NTE : ${equipmentName} (${equipmentInfo?.["equipment type"]}) IP: ${ipOnly}</h1>`;

    const motsInterdits = ["inte", "vpnip"];
    if (!motsInterdits.some(mot => name.includes(mot))) {
        if (name.includes("ixen")) {
        // On récupère le seul OAM IXEN dont l'IP matche celle du NTE
        const oamEntry = dataToDisplay.find(entry =>
            entry.oam
            && entry.oam.ip_equipement === ipOnly
            && entry.oam["OAM_IXEN"] !== undefined
        );

        if (oamEntry) {
            const oamValue = oamEntry.oam["OAM_IXEN"];
            const classOAM = oamValue.includes("KO") ? "surligneR" : "surligne";
            htmlContent.NTE +=
            `<h2><strong class="${classOAM}">OAM NTE : ${oamValue}</strong></h2>`;
        }
        // sinon : aucun OAM IXEN à afficher pour cette IP
        } else {
        // Cas “non IXEN” : on utilise ta méthode standard
        htmlContent.NTE += afficherService.getOAM();
        }
    }

    htmlContent.NTE += afficherService.getNTE();
  }
}



function processIxen(data, htmlContent) {
    const nteItems = data.filter(item =>
        typeof item['equipment name'] === 'string' &&
        item['equipment name'].toLowerCase().startsWith('nte-')
    );

    nteItems.forEach((nte, index) => {
        const nteName = nte['equipment name'].trim();
        const matchLastDigit = nteName.match(/(\d)$/);
        if (!matchLastDigit) {
            console.log(`❌ Nom NTE invalide : ${nteName}`);
            return;
        }
        const lastDigit = matchLastDigit[1];

        const linked = data.find(item => {
            if (item === nte) return false;
            const portVal = item.port || item['snmp info']?.port;
            if (typeof portVal !== 'string') return false;
            return portVal.trim().endsWith(lastDigit);
        });

        if (linked) {

            // Appel des fonctions de traitement habituelles
            processNTE(nte, htmlContent, data);
            processOtherEquipment(linked, htmlContent, data);
        }
    });
}

function processOtherEquipment(item, htmlContent, dataToDisplay) {
    const afficherService = AfficherService.fromDataToDisplay(dataToDisplay, item);
    const equipmentNameRaw = item["equipment name"];
    const equipmentName = equipmentNameRaw?.toLowerCase();
    const equipmentInfo = item["equipment_info"];
    const isDeliveryPort = item["type acces"]?.includes("Port de Livraison");

    if (!equipmentName) {
        console.error("Nom d'équipement manquant :", item);
        return;
    }

    const getTitle = (label) => {
        return isDeliveryPort
            ? `<h2>Livraison : ${equipmentName}</h2>`
            : `<h2>Équipement ${label}: ${equipmentName}</h2>`;
    };

    const actions = {
        olt: () => {
            if (equipmentInfo['equipment type']?.includes("5800")) {
                htmlContent.NTE += afficherService.getOLT5800();
            } else {
                htmlContent.NTE += afficherService.getOLT();
            }
        },
        edg: () => {
            htmlContent.NTE += getTitle("EDG");
            htmlContent.NTE += afficherService.getEDG();
        },
        swa: () => {
            htmlContent.NTE += getTitle("SWA");
            htmlContent.NTE += afficherService.getSWA();
        },
        cor: () => {
            htmlContent.NTE += getTitle("COR");
            htmlContent.NTE += afficherService.getCOR();
        },            
        mpe: () => {
                htmlContent.NTE += getTitle("MPE");
                htmlContent.NTE += afficherService.getMPE();
            }
    };

    Object.keys(actions).forEach(key => {
        const regex = new RegExp(key, 'g');
        if (equipmentName.match(regex)) {
            actions[key]();
            if (isDeliveryPort) {
                htmlContent.NTE += afficherService.getVPLS();
            }
        }
    });
}





function normalize(value) {
    return value?.replace(/[",/]/g, '').trim().toLowerCase();
}

window.toggleNego = function (id) {
  const detailsRow = document.getElementById(`details-${id}`);
  const chevron = document.getElementById(`chevron-${id}`);

  if (detailsRow && chevron) {
    if (detailsRow.style.display === "none" || detailsRow.style.display === "") {
      detailsRow.style.display = "table-row";
      chevron.textContent = "▼"; // flèche vers le bas
    } else {
      detailsRow.style.display = "none";
      chevron.textContent = "▶"; // flèche vers la droite
    }
  }
};
