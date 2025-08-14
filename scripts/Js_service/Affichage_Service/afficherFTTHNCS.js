function checkConfigCommande(configured, commande) {
    if (!configured || !commande) return null;

    const tcont = configured.tcont?.match(/(\d+)M$/)?.[1];
    const scheduler = configured.scheduler?.match(/(\d+)M$/)?.[1];

    const uploadCmd = commande.upload;
    const downloadCmd = commande.download;

    return tcont === uploadCmd && scheduler === downloadCmd;
}


function isEmptyMACResult(macResults, types) {
    if (!Array.isArray(macResults) || macResults.length === 0) return true;

    const result = {
        vide: [],
        nonVide: [],
    };

    for (const equipement of macResults) {
        for (const equipementName in equipement) {
            const macData = equipement[equipementName];
            let hasMac = false;

            for (const type of types) {
                if (Array.isArray(macData?.[type]) && macData[type].length > 0) {
                    hasMac = true;
                    break;
                }
            }

            if (hasMac) {
                result.nonVide.push(equipementName);
            } else {
                result.vide.push(equipementName);
            }
        }
    }

    return result;
}
export function FTTHNCS(dataToDisplay) {
    if (!dataToDisplay || dataToDisplay.length === 0) {
        return "<p>Aucune donnée à afficher.</p>";
    }

    const data = dataToDisplay[0].data || {};
    const jsonBuild = dataToDisplay[0].Json_Build || {};
    const resultMAC = dataToDisplay[0].resultMAC || {};

    const addIfExists = (label, value, unit = '') =>
        value !== undefined && value !== null ? `<p>${label} : ${value}${unit}</p>` : '';

    const statusOnt = data.status_ont || "";
    const motsClesErreurs = ["loss", "failure", "inactif"];

    const erreursDetectees = statusOnt
        .split(",")
        .map(e => e.trim())
        .filter(msg => motsClesErreurs.some(motCle => msg.toLowerCase().includes(motCle)));

    let html = `<div>`;

    // Bloc erreurs
    if (erreursDetectees.length > 0) {
        html += `<div style="border: 2px solid red; padding: 10px; border-radius: 5px; background-color: #ffe6e6;">
            <p style="color: red; font-weight: bold;">❌ Erreurs détectées :</p><ul>`;
        erreursDetectees.forEach(err => {
            html += `<li style="color: red;">${err}</li>`;
        });
        html += `</ul></div>`;
    }

    let globalNonConformity = false;
    let globalNullConfig = false; // Variable pour suivre les null de checkConfigCommande
    let causeNullConfig = "";
    let uniIdCounter = 1;

    if (!data.uni || Object.keys(data.uni).length === 0) {
        data.uni = {};
        const fallbackUnis = jsonBuild.uni || resultMAC.unis || {};
        for (const key in fallbackUnis) {
            data.uni[uniIdCounter] = {};
            uniIdCounter++;
        }
        if (Object.keys(data.uni).length === 0) {
            data.uni[uniIdCounter] = {};
        }
    }

    // Vérification globale des profils
    for (let uniId in data.uni) {
        const portData = data.uni[uniId];
        const profilCommande = jsonBuild?.uni?.[uniId]?.profil?.commande || resultMAC?.unis?.[uniId];
        const profilConfigured = portData?.profil?.configured;
        const isProfilOK = checkConfigCommande(profilConfigured, profilCommande);

        if (isProfilOK && typeof isProfilOK === 'object') {
            if (isProfilOK.status === false) {
                globalNonConformity = true;
                break;
            } else if (isProfilOK.status === null) {
                globalNullConfig = true;
                if (!profilConfigured) {
                    causeNullConfig = "configuré manquant";
                } else if (!profilCommande) {
                    causeNullConfig = "commandé manquant";
                }
            }
        } else if (isProfilOK === false) {
            globalNonConformity = true;
            break;
        } else if (isProfilOK === null) {
            globalNullConfig = true;
            if (!profilConfigured) {
                causeNullConfig = "configuré manquant";
            } else if (!profilCommande) {
                causeNullConfig = "commandé manquant";
            }
        }
    }

    if (globalNonConformity) {
        html += `<p style="color: red; font-weight: bold;">⚠️ Différence détectée entre le profil commandé et le profil configuré.</p>`;
    } else if (globalNullConfig) {
        html += `<p style="color: red; font-weight: bold;">⚠️ Absence de profil : ${causeNullConfig}.</p>`;
    }

    // Détermination du style pour les puissances
    let powerClass = (globalNonConformity || erreursDetectees.length > 0) ? "carre-rouge" : "carre-vert";

    if (jsonBuild.olt || jsonBuild.slot || jsonBuild.port || jsonBuild.onu_id) {
        html += `<p><strong>Gestion OLT :</strong></p><p>`;
        if (jsonBuild.olt) html += `OLT : ${jsonBuild.olt}, `;
        if (jsonBuild.slot) html += `Slot : ${jsonBuild.slot}, `;
        if (jsonBuild.port) html += `Port : ${jsonBuild.port}, `;
        if (jsonBuild.onu_id) html += `ONU ID : ${jsonBuild.onu_id}`;
        html += `</p>`;
    }

    html += addIfExists("Port Coupleur", jsonBuild?.onu_id);
    html += addIfExists("SLID", data?.slid);

    if (data?.adminstatus_pon || data?.operstatus_pon) {
        const isAdminOk = /(up|normal|active)/i.test(data.adminstatus_pon);
        const isOperOk = /(up|normal|active)/i.test(data.operstatus_pon);
        html += `<p><strong>Validation actif :</strong></p>
        <p>Admin/Oper State PON :
            ${data.adminstatus_pon ? `<span class='${isAdminOk ? "carre-vert" : "carre-rouge"}'> ${data.adminstatus_pon}</span>` : ''}
            /
            ${data.operstatus_pon ? `<span class='${isOperOk ? "carre-vert" : "carre-rouge"}'> ${data.operstatus_pon}</span>` : ''}
        </p>`;
    }

    html += addIfExists("Num de série", data?.serial_number);
    html += addIfExists("Version Software", data?.version);
    html += addIfExists("Version Hardware", data?.version_hardware);
    html += addIfExists("Type ONT", data?.type_ont);
    html += addIfExists("Statut de l'ONT", data?.status_ont);

    // Gestion du statut puissance Rx/Tx
    let puissanceStatus = null;

    for (let uniId in data.uni) {
        const portData = data.uni[uniId];
        const profilCommande = jsonBuild?.uni?.[uniId]?.profil?.commande || resultMAC?.unis?.[uniId];
        const profilConfigured = portData?.profil?.configured;
        const isProfilOK = checkConfigCommande(profilConfigured, profilCommande);

        // Extraire le statut de façon sûre
        let status = null;
        if (isProfilOK && typeof isProfilOK === "object") {
            status = isProfilOK.status;
        } else {
            status = isProfilOK;
        }

        if (status === false) {
            puissanceStatus = false; // non conforme → rouge
            break; // Priorité au rouge, on arrête la boucle
        } else if (status === null && puissanceStatus !== false) {
            puissanceStatus = null; // incomplet → gris
        } else if (status === true && puissanceStatus === null) {
            puissanceStatus = true; // conforme → vert, sauf si remplacé plus tard
        }
    }

    if (puissanceStatus === true) {
        powerClass = "carre-vert";
    } else if (puissanceStatus === false) {
        powerClass = "carre-rouge";
    } else {
        powerClass = "carre-gris";
    }

    if (erreursDetectees.length === 0) {
        html += `<p>Rx Power ONT venant de l'OLT : <span class="${powerClass}">${data?.rx_signal_level_ont ?? "?"} dBm</span></p>`;
        html += `<p>Tx Power ONT allant vers l'OLT : ${data?.tx_signal_level_ont ?? "?"} dBm </p>`;
        html += `<p>Rx Power OLT venant de l'ONT : <span class="${powerClass}">${data?.rx_sig_level_olt ?? "?"} dBm</span></p>`;
    }


    html += addIfExists("Distance", data?.distance, " km");

    // Détails par UNI
    for (let uniId in data.uni) {
        const portData = data.uni[uniId];
        const profilCommande = jsonBuild?.uni?.[uniId]?.profil?.commande || resultMAC?.unis?.[uniId];
        const profilConfigured = portData?.profil?.configured;
        const isProfilOK = checkConfigCommande(profilConfigured, profilCommande);

        html += `
        <hr>
        <div style="border: 1px solid #ccc; padding: 6px; border-radius: 5px; margin-bottom: 10px;">`;

        if (portData?.adminstatus_uni || portData?.operstatus_uni) {
            const isAdminUp = /up/i.test(portData.adminstatus_uni);
            const isOperUp = /up/i.test(portData.operstatus_uni);
            html += `<p><strong>Admin/Oper State UNI ${uniId} :</strong>
                <span class='${isAdminUp ? "carre-vert" : "carre-rouge"}'>${portData.adminstatus_uni || "?"}</span> /
                <span class='${isOperUp ? "carre-vert" : "carre-rouge"}'>${portData.operstatus_uni || "?"}</span>
            </p>`;
        }

        if (profilCommande) {
            html += `
            <p onclick="toggleNego('profil-uni-${uniId}')" style="cursor:pointer;">
                <strong>Conformité profil :</strong>
                <span class="${(isProfilOK.status === true && erreursDetectees.length === 0) ? "carre-vert" : "carre-rouge"}">Upload / Download</span>
                <span class="chevron" id="chevron-profil-uni-${uniId}">▶</span>
            </p>
            <ul id="details-profil-uni-${uniId}" style="display:none;">
                ${profilCommande.upload ? `<li>Profil commandé : Up : ${profilCommande.upload} Mbps</li>` : ''}
                ${profilCommande.download ? `<li>Down : ${profilCommande.download} Mbps</li>` : ''}
                ${profilCommande.class ? `<li>Classe : ${profilCommande.class}</li>` : ''}
                ${profilCommande.type ? `<li>Type d'objet : ${profilCommande.type}</li>` : ''}
            </ul>`;
        }

        html += addIfExists("Négociation configurée", "Auto-Auto");
        html += addIfExists("Négociation active", portData?.speed?.negociated_speed);
        html += `<p><strong>MAC Learning :</strong><span class="carre-vert"> OK</span></p>`;

        const counter = portData?.counter;
        if (counter) {
            html += `
            <p onclick="toggleNego('stats-uni-${uniId}')" style="cursor:pointer;">
                <strong>Statistiques :</strong> <span class="chevron" id="chevron-stats-uni-${uniId}">▶</span>
            </p>
            <ul id="details-stats-uni-${uniId}" style="display:none;">
                ${counter.forwarded_in ? `<li>Entrées transmises : ${counter.forwarded_in}</li>` : ''}
                ${counter.forwarded_out ? `<li>Sorties transmises : ${counter.forwarded_out}</li>` : ''}
                ${counter.discarded_in ? `<li>Paquets rejetés en entrée : ${counter.discarded_in}</li>` : ''}
                ${counter.discarded_out ? `<li>Paquets rejetés en sortie : ${counter.discarded_out}</li>` : ''}
            </ul>`;
        }

        html += `</div>`;
    }

    const mac = dataToDisplay[0].resultMAC;

    if (mac?.port_collecte) {
        const collecte = dataToDisplay[0].resultats_collecte || [];
        html += `<hr><p><strong>Collecte :</strong> ${mac.port_collecte.equipement} | VPLS : ${mac.port_collecte.id_technique}</p>`;
        html += genererTableMAC(collecte, ["MAC_SAP"]);
    }

    if (mac?.port_livraison) {
        const livraison = dataToDisplay[0].resultats_livraison || [];
        const portsLivraison = Array.isArray(mac.port_livraison) ? mac.port_livraison : [mac.port_livraison];

        portsLivraison.forEach((port, index) => {
            html += `<hr><p><strong>Livraison :</strong> ${port.equipement} | VPLS : ${port.id_technique}</p>`;
            const equipementData = livraison[index] ? [livraison[index]] : [];
            html += genererTableMAC(equipementData, ["MAC_SAP", "MAC_SDP"]);
        });
    }

    html += "</div>";
    rectangleDonnee.innerHTML = html;
    return html;
}



function genererTableMAC(liste, types) {
    // Cas 1 : liste vide ou non fournie → invite à appuyer sur le bouton
    if (!Array.isArray(liste) || liste.length === 0) {
        return `<p style="color:gray;"><em>Veuillez appuyer sur le bouton Analyse avec détails pour avoir les adresses MAC.</em></p>`;
    }

    const macStatus = isEmptyMACResult(liste, types);

    // Cas 2 : la liste contient des équipements, mais aucun n’a de MAC
    if (macStatus.nonVide.length === 0 && macStatus.vide.length > 0) {
        let html = "";
        macStatus.vide.forEach(name => {
            html += `<p style="color:gray;"><em>Pas de MAC disponible pour l'équipement : ${name}</em></p>`;
        });
        return html;
    }

    // Cas normal : au moins une MAC trouvée
    let table = `
        <table border="1" cellpadding="4" cellspacing="0" style="border-collapse:collapse;">
            <thead>
                <tr>
                    <th>MAC</th>
                    <th>Source-Identifier</th>
                    <th>Last Change</th>
                </tr>
            </thead>
            <tbody>
    `;

    liste.forEach(equipement => {
        for (const equipementName in equipement) {
            const macData = equipement[equipementName];
            types.forEach(type => {
                if (Array.isArray(macData?.[type])) {
                    macData[type].forEach(macEntry => {
                        const dateStr = formatDate(macEntry?.Date);
                        table += `
                            <tr>
                                <td>${macEntry?.["Adresse MAC"] || ''}</td>
                                <td>${macEntry?.["Source identifier"] || ''}</td>
                                <td>${dateStr}</td>
                            </tr>
                        `;
                    });
                }
            });
        }
    });

    table += `</tbody></table>`;

    // Ajouter un message pour les équipements vides s'il y en a
    if (macStatus.vide.length > 0) {
        macStatus.vide.forEach(name => {
            table += `<p style="color:gray;"><em>Pas de MAC disponible pour l'équipement : ${name}</em></p>`;
        });
    }

    return table;
}



function formatDate(dateStr) {
    const d = new Date(dateStr);
    const pad = n => (n < 10 ? '0' + n : n);
    if (isNaN(d)) return dateStr;
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear().toString().slice(2)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
