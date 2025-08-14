export function VPLS(equipmentName, idTechnique, adressesMAC) {
    if (
        !adressesMAC ||
        (!Array.isArray(adressesMAC.MAC_SAP) && !Array.isArray(adressesMAC.MAC_SDP)) ||
        ((adressesMAC.MAC_SAP?.length || 0) === 0 && (adressesMAC.MAC_SDP?.length || 0) === 0)
    ) {
        return `<p> </p>`;
    }

    let htmlContentMAC = `
        <ul>
            <h2>Livraison : ${equipmentName} VPLS : ${idTechnique}:</h2>
            <table border='0'>
                <tr class='Tableaux'>
                    <th>Adresse MAC</th>
                    <th>Source identifier</th>
                    <th>Date</th>
                </tr>`;

    const concatMACs = [...(adressesMAC.MAC_SAP || []), ...(adressesMAC.MAC_SDP || [])];

    concatMACs.forEach(adresse => {
        htmlContentMAC += `
            <tr>
                <td>${adresse["Adresse MAC"] || "Non disponible"}</td>
                <td>${adresse["Source identifier"] || "Non disponible"}</td>
                <td>${adresse["Date"] || "Non disponible"}</td>
            </tr>`;
    });
    htmlContentMAC += `
            </table>
        </ul>`;

    return htmlContentMAC;
}
