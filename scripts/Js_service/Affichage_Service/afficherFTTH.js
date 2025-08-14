export function FTTH(dataToDisplay) {
    if (!dataToDisplay || dataToDisplay.length === 0) {
        return "<p>Aucune donnée à afficher.</p>";
    }

    console.log(dataToDisplay);

    const firstItem = dataToDisplay[0];
    const hasSnmpInfoAd = "Snmp info additionnel" in firstItem;
    const snmpInfoAd = hasSnmpInfoAd ? firstItem["Snmp info additionnel"] : null;
    const snmpInfo = firstItem["Snmp info"] || {};

    let htmlContentFTTAd = "";

    if (hasSnmpInfoAd && snmpInfoAd) {
        const [numTubePM, couleurTubePM] = (snmpInfoAd["info_tube_module_pm"] || "").split(":");
        const [numFibrePM, couleurFibrePM] = (snmpInfoAd["info_fibre_module_pm"] || "").split(":");
        const [numTubePBO, couleurTubePBO] = (snmpInfoAd["info_tube_pbo"] || "").split(":");
        const [numFibrePBO, couleurFibrePBO] = (snmpInfoAd["info_fibre_pbo"] || "").split(":");

        htmlContentFTTAd = `
        <h2>Dossier immeuble</h2>
        <table border='0'>
            <tr>
                <td><strong>Adresse :</strong>
                ${snmpInfoAd["numero_voie"] || "Non disponible"} ${snmpInfoAd["type_voie"] || ""} ${snmpInfoAd["libelle_voie"] || ""} ${snmpInfoAd["code_postal"] || ""} ${snmpInfoAd["commune"] || ""}</td>
            </tr>
        </table>
        <table border='0'>
            <tr>
                <td><strong>Escalier : </strong>${snmpInfoAd["escalier"] || "Non disponible"}</td>
                <td><strong>Bâtiment : </strong>${snmpInfoAd["batiment"] || "Non disponible"}</td>
                <td><strong>Étage : </strong>${snmpInfoAd["etage"] || "Non disponible"}</td>
            </tr>
            <tr>
                <td><strong>Code adresse : </strong>${snmpInfoAd["code_adresse"] || "Non disponible"}</td>
            </tr>
        </table>
        <h2>Gestion PM/PBO/PTO</h2>
        <table border='0'>
            <tr><td><strong>Ref PM : </strong>${snmpInfoAd["reference_pm_commande"] || "Non disponible"}</td></tr>
            <tr>
                <td><strong>Nom Module PM : </strong>${snmpInfoAd["nom_module_pm"] || "Non disponible"}</td>
                <td><strong>Position Module PM : </strong>${snmpInfoAd["position_module_pm"] || "Non disponible"}</td>
            </tr>
            <tr><td><strong>Ref Cable Module PM : </strong>${snmpInfoAd["ref_cable_module_pm"] || "Non disponible"}</td></tr>
            <tr>
                <td><strong>Num Tube Module PM : </strong>${numTubePM || "Non disponible"}</td>
                <td><strong>Couleur Tube Module PM : </strong>${couleurTubePM || "Non disponible"}</td>
            </tr>
            <tr>
                <td><strong>Num Fibre Module PM : </strong>${numFibrePM || "Non disponible"}</td>
                <td><strong>Couleur Fibre Module PM : </strong>${couleurFibrePM || "Non disponible"}</td>
            </tr>
            <tr><td><strong>Ref PBO : </strong>${snmpInfoAd["ref_pbo"] || "Non disponible"}</td></tr>
            <tr>
                <td><strong>Num Tube PBO : </strong>${numTubePBO || "Non disponible"}</td>
                <td><strong>Couleur Tube PBO : </strong>${couleurTubePBO || "Non disponible"}</td>
            </tr>
            <tr>
                <td><strong>Num Fibre PBO : </strong>${numFibrePBO || "Non disponible"}</td>
                <td><strong>Couleur Fibre PBO : </strong>${couleurFibrePBO || "Non disponible"}</td>
            </tr>
            <tr>
                <td><strong>Connecteur Prise Numéro : </strong>${snmpInfoAd["connecteur_prise_numero"] || "Non disponible"}</td>
                <td><strong>Couleur Connecteur Prise : </strong>${snmpInfoAd["connecteur_prise_couleur"] || "Non disponible"}</td>
            </tr>
            <tr><td><strong>Ref PTO : </strong>${snmpInfoAd["ref_prise_cr"] || "Non disponible"}</td></tr>
        </table>`;
    }

    const adminState = snmpInfo["Admin state"] ?? "Non disponible";
    const operState = snmpInfo["oper state"] ?? "Non disponible";

    const getColorClass = (value, expected = "up") => {
        if (value === "Non disponible") return "carre-rouge";
        return value === expected ? "carre-vert" : "carre-rouge";
    };

    const htmlContentFTTH = `
        <h2>Gestion OLT</h2>
        <table border='0'>
            <tr><td><strong>OLT : </strong> ${firstItem["Olt"] || "Non disponible"}</td></tr>
            <tr><td><strong>Slot : </strong> ${firstItem["Slot"] || "Non disponible"}</td></tr>
            <tr><td><strong>Port : </strong> ${firstItem["Port"] || "Non disponible"}</td></tr>
            <tr><td><strong>ONU ID: </strong> ${firstItem["Onu_id"] || "Non disponible"}</td></tr>
        </table>

        <h2>Validation actif</h2>
        <table border='0'>
            <tr>
                <td><strong>Admin/Oper State PON</strong>
                    <span class='${getColorClass(adminState, "active")}'>${adminState}</span>
                    <span class='${getColorClass(operState, "up")}'>${operState}</span>
                </td>
            </tr>
            <tr><td><strong>Slid : </strong> ${snmpInfo["slid"] || "Non disponible"}</td></tr>
            <tr><td><strong>Num de série : </strong> ${snmpInfo["serial number"] || "Non disponible"}</td></tr>
            <tr><td><strong>Version Software : </strong> ${snmpInfo["version"] || "Non disponible"}</td></tr>
            <tr><td><strong>Version Hardware : </strong> ${snmpInfo["version hardware"] || "Non disponible"}</td></tr>
            <tr><td><strong>Type ONT : </strong> ${snmpInfo["type ont"] || "Non disponible"}</td></tr>
            <tr><td><strong>Statut de l'ONT : </strong> <span class='carre-vert'>${snmpInfo["Status ont"] || "Non disponible"}</span></td></tr>
            <tr><td><strong>Rx Power ONT venant de l'OLT : </strong> ${snmpInfo["rx signal level ont"] || "Non disponible"} dBm</td></tr>
            <tr><td><strong>Tx Power ONT allant vers l'OLT : </strong> ${snmpInfo["tx signal level ont"] || "Non disponible"} dBm</td></tr>
            <tr><td><strong>Rx Power OLT venant de l'ONT : </strong> ${snmpInfo["rx sig level olt"] || "Non disponible"} dBm</td></tr>
            <tr><td><strong>Distance : </strong> ${snmpInfo["distance"] || "Non disponible"} km</td></tr>
            <tr><td><strong>MAC box : </strong> ${snmpInfo["mac subscriber id"] || "Non disponible"}</td></tr>
        </table>

        <h2>Validation BNG</h2>
        <table border='0'>
            <tr>
                <td><strong>Status Subscriber : </strong>
                    <span class='${getColorClass(snmpInfo["status subscriber id"], "up")}'>${snmpInfo["status subscriber id"] || "Non disponible"}</span>
                </td>
            </tr>
            <tr><td><strong>Attribut class reçu : </strong> ${snmpInfo["sla subscriber id"] || "Non disponible"}</td></tr>
            <tr><td><strong>IP : </strong> ${snmpInfo["ip subscriber id"] || "Non disponible"}</td></tr>
            <tr><td><strong>MAC : </strong> ${snmpInfo["mac subscriber id"] || "Non disponible"}</td></tr>
        </table>`;

    return htmlContentFTTAd + htmlContentFTTH;
}
