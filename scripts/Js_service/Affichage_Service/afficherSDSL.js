export function SDSL(dataToDisplay) {
    const telnetData = dataToDisplay?.connectivite?.telnet || [];
    const macResult = telnetData.find(t => t.commande.includes("display mac-address"))?.resultat || {};
    const interfaceResult = telnetData.find(t => t.commande.includes("display interface"))?.resultat || {};

    const port = interfaceResult?.["Description"]?.split("-").pop() || "?";
    const uptime = interfaceResult?.["Hardware is STU-C Last up time"] || "-";
    const downtime = interfaceResult?.["Last down time"] || "-";

    const techno = dataToDisplay?.donnees_origine?.data_refpro?.items?.[0]?.techno_sdsl || "";
    const technoNorm = techno.toLowerCase();
    let nbPaires = 1;
    if (technoNorm.includes("quadripaire")) nbPaires = 4;
    else if (technoNorm.includes("bipaire")) nbPaires = 2;

    const quadriData = dataToDisplay?.interface_status?.quadripaire_cmd || {};
    const monoData = dataToDisplay?.interface_status?.mono_cmd || {};

    const rateMono = interfaceResult?.["Current line rate (kbps)"] || "-";
    const rateQuadri = interfaceResult?.["Current line rate of group EFM 12(kbps)"] || null;
    const rate = (nbPaires === 4 && rateQuadri) ? rateQuadri : rateMono;

    const upstreamBytes = interfaceResult?.["Total bytes num upstream (byte)"] || "-";
    const upstreamPackets = interfaceResult?.["Total packets num upstream (packet)"] || "-";
    const downstreamBytes = interfaceResult?.["Total bytes num downstream (byte)"] || "-";
    const downstreamPackets = interfaceResult?.["Total packets num downstream (packet)"] || "-";

    const mac_vlan = dataToDisplay?.connectivite?.mac_vlan || {};
    const nteInfo = dataToDisplay?.nte?.traitement_specifique?.sdslplus_mng || {};
    const nteName = dataToDisplay?.nte?.nom || "?";
    const nteIP = dataToDisplay?.nte?.ping?.ip_nte || "?";

    const vplsLivraison = dataToDisplay?.VPlS?.[0]?.resultat || {};
    const macSAP = vplsLivraison.MAC_SAP || [];
    const macSDP = vplsLivraison.MAC_SDP || [];

    let statuslien = "down";
    const firstItem = dataToDisplay?.donnees_origine?.data_refpro?.items?.[0];
    if (firstItem && typeof firstItem.statut_production === "string") {
        const statut = firstItem.statut_production.toLowerCase();
        if (statut.includes("ok")) {
            statuslien = "up";
        }
    }

    const isUp = statuslien === "up";
    const couleur = isUp ? "carre-vert" : "carre-rouge";

    let html = `<div>
        <h2>État de la ligne DSL</h2>
        <p>Port : ${port}</p>
        <p>État du lien : <span class="${couleur}">${statuslien}</span></p>`;

    if (nbPaires > 1) {
        html += `<h3>Mesures Multi-paires</h3>`;
        for (let i = 1; i <= nbPaires; i++) {
            const attenuation = quadriData[`PORT_QUADRI${i}_ATTENUATION`] || "-";
            const snr = quadriData[`PORT_QUADRI${i}_SNR`] || "-";
            html += `
                <p>Paire ${i} - Atténuation : <span class="${couleur}">${attenuation} dB</span> - SNR : <span class="${couleur}">${snr} dB</span></p>`;
        }
    } else {
        const att = monoData.PORT_MONO_ATTENUTATION || "-";
        const snr = monoData.PORT_MONO_SNR || "-";
        html += `
            <p>Atténuation : <span class="${couleur}">${att} dB</span></p>
            <p>SNR : <span class="${couleur}">${snr} dB</span></p>`;
    }

    html += `
        <p>Dernier up : ${uptime}</p>
        <p>Dernier down : ${downtime}</p>
        <p>Débit actuel : ${rate} kbps</p>`;

    html += `
        <h2>Statistiques de trafic</h2>
        <p>Bytes envoyés (upstream) : ${upstreamBytes}</p>
        <p>Packets envoyés : ${upstreamPackets}</p>
        <p>Bytes reçus (downstream) : ${downstreamBytes}</p>
        <p>Packets reçus : ${downstreamPackets}</p>`;

    html += `
        <h2>VLAN / MAC (DSLAM)</h2>
        <table border="1" cellpadding="4" cellspacing="0">
            <thead>
                <tr>
                    <th>VLAN</th>
                    <th>Adresse MAC</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>${mac_vlan.VLAN_MNG || "-"}</td>
                    <td>${mac_vlan.MAC_MNG || "-"}</td>
                </tr>
                <tr>
                    <td>${mac_vlan.VLAN_DATA || "-"}</td>
                    <td>${mac_vlan.MAC_DATA || "-"}</td>
                </tr>
            </tbody>
        </table>`;

    const rancidStatusClass = (nteInfo.RANCID_OK || "").toLowerCase().includes("ok") ? "carre-vert" : "carre-rouge";

    html += `
        <h2>Informations NTE</h2>
        <p>Nom : ${nteName}</p>
        <p>IP : ${nteIP}</p>`;
    
    if (nteInfo.PING) {
        html += `<p>${nteInfo.PING}</p>`;
    }
    if (nteInfo.PING_NOK) {
        html += `<p><span class="carre-rouge">${nteInfo.PING_NOK}</span></p>`;
    }
    if (nteInfo.TYPE) {
        html += `<p>${nteInfo.TYPE}</p>`;
    }
    if (nteInfo.VERSION) {
        html += `<p><span class="${rancidStatusClass}">${nteInfo.VERSION}</span></p>`;
    }
    if (nteInfo.RANCID_OK) {
        html += `<p><span class="${rancidStatusClass}">${nteInfo.RANCID_OK}</span></p>`;
    }

    const allMacs = [...macSAP, ...macSDP];
    html += `
        <h2>Livraison VPLS</h2>
        <p>Équipement : ${dataToDisplay?.VPlS?.[0]?.equipement || "?"}</p>
        <p>ID technique : ${dataToDisplay?.VPlS?.[0]?.id_technique || "?"}</p>`;

    if (allMacs.length > 0) {
        html += `
            <table border="1" cellpadding="4" cellspacing="0">
                <thead>
                    <tr>
                        <th>MAC</th>
                        <th>Source-Identifier</th>
                        <th>Dernier changement</th>
                    </tr>
                </thead>
                <tbody>`;
        allMacs.forEach(mac => {
            html += `
                    <tr>
                        <td>${mac["Adresse MAC"] || "-"}</td>
                        <td>${mac["Source identifier"] || "-"}</td>
                        <td>${mac["Date"] || "-"}</td>
                    </tr>`;
        });
        html += `</tbody></table>`;
    } else {
        html += `<p>Aucune adresse MAC trouvée.</p>`;
    }

    html += `</div>`;
    return html;
}
