export function OSENXGSP(dataToDisplay) {
    if (!dataToDisplay || dataToDisplay.length === 0) {
        return "<p>Aucune donnée à afficher.</p>";
    }

    const ont = dataToDisplay.find(d => d.type === "ONT");
    const olt = dataToDisplay.find(d => d.type === "OLT");
    const livraison = dataToDisplay.find(d => d.type === "Port de Livraison");

    const oltDetails = olt?.details?.[0] || {};
    const snmp = oltDetails["Snmp info"] || {};
    const snmpAdd = oltDetails["Snmp info additionnel"] || {};

    const slid = snmpAdd["slid_activation"] || snmp["slid"] || "?";
    const vpls = livraison?.VPLS || {};
    const macSAP = vpls.MAC_SAP || [];
    const macSDP = vpls.MAC_SDP || [];

    const formatDate = dateStr => {
        if (!dateStr) return "-";
        const parsed = new Date(dateStr);
        if (!isNaN(parsed)) {
            const mm = (parsed.getMonth() + 1).toString().padStart(2, "0");
            const dd = parsed.getDate().toString().padStart(2, "0");
            const yy = parsed.getFullYear().toString().slice(2);
            const time = parsed.toTimeString().slice(0, 8);
            return `${mm}/${dd}/${yy} ${time}`;
        }
        return dateStr;
    };

    const addLine = (label, value, unit = "") =>
        value !== undefined && value !== null && value !== "" ? `<p>${label} : ${value}${unit}</p>` : "";

    const wrapStatus = (value) => {
        const val = (value || "").toLowerCase();
        const okKeywords = ["up", "ok", "normal", "active", "unlocked"];
        const isOk = okKeywords.some(keyword => val.includes(keyword));
        const color = isOk ? "carre-vert" : "carre-rouge";
        return `<span class="${color}">${value || "?"}</span>`;
    };


    let html = `<div>`;

    // --- Gestion OLT ---
    html += `
    <h2>Informations OLT</h2>
    <div style="border: 1px solid #ccc; padding: 10px; border-radius: 6px; margin-bottom: 15px; background-color: #f9f9f9;">
        <p><strong>Gestion OLT :</strong></p>
        <p>OLT : ${oltDetails.Olt || "?"}, Slot : ${oltDetails.Slot || "?"}, Port : ${oltDetails.Port || "?"}, ONU ID : ${oltDetails.Onu_id || "?"}</p>
        <p>Port Coupleur : ${oltDetails.Onu_id || "?"}</p>
        <p>SLID : ${slid}</p>
    </div>`;

    // --- Validation actif ---
    html += `
    <h2>État de l'équipement actif</h2>
    <div style="border: 1px solid #ccc; padding: 10px; border-radius: 6px; margin-bottom: 15px; background-color: #f9f9f9;">
        <p><strong>Validation actif :</strong></p>
        <p>Admin/Oper State PON : ${wrapStatus(snmp["Admin state"])} / ${wrapStatus(snmp["oper state"])}</p>
        ${addLine("SLID", slid)}
        ${addLine("Num de serie", snmp["serial number"])}
        ${addLine("Version Software", snmp["version"])}
        ${addLine("Version Hardware", snmp["version hardware"])}
        ${addLine("Type ONT", snmp["type ont"])}
        ${addLine("Statut de l'ont", wrapStatus(snmp["Status ont"]))}
        ${addLine("Rx Power ONT venant de l'OLT", snmp["rx signal level ont"], " dBm")}
        ${addLine("Tx Power ONT allant vers l'OLT", snmp["tx signal level ont"], " dBm")}
        ${addLine("Rx Power OLT venant de l'ONT", snmp["rx sig level olt"], " dBm")}
        ${addLine("Distance", snmp["distance"], " km")}
        <p>Admin/Oper State UNI : ${wrapStatus(snmp["Admin state uni"])} / ${wrapStatus(snmp["operstate uni"])}</p>
    `;

    if (snmp["mac uni box"]) {
        const lines = snmp["mac uni box"].split("\n");
        lines.forEach(line => {
            html += `<p>Mac box ${line.trim()}</p>`;
        });
    }
    html += `</div>`; // Fin Validation actif

    // --- Livraison ---
    html += `
    <hr>
    <h2>Informations de Livraison</h2>
    <div style="border: 1px solid #ccc; padding: 10px; border-radius: 6px; margin-bottom: 15px; background-color: #f9f9f9;">
        <p><strong>Livraison :</strong></p>
        <p>Equipement : ${livraison?.equipment || "?"} | ID technique : ${macSAP[0]?.VPLS || macSDP[0]?.VPLS || "?"}</p>
    </div>`;

    // --- Tableau MAC ---
    const allMacs = [...macSAP, ...macSDP];
    if (allMacs.length > 0) {
        html += `
        
        <table border="1" cellpadding="4" cellspacing="0" style="border-collapse:collapse; margin-bottom: 15px;">
            <thead style="background-color:#ddd;">
                <tr>
                    <th>MAC</th>
                    <th>Source-Identifier</th>
                    <th>Last Change</th>
                </tr>
            </thead>
            <tbody>`;
        allMacs.forEach(mac => {
            html += `
            <tr>
                <td>${mac["Adresse MAC"] || ""}</td>
                <td>${mac["Source identifier"] || ""}</td>
                <td>${formatDate(mac["Date"])}</td>
            </tr>`;
        });
        html += `</tbody></table>`;
    } else {
        html += `<p style="color: gray; font-style: italic;">Aucune adresse MAC trouvée.</p>`;
    }

    html += `</div>`;

    return html;
}