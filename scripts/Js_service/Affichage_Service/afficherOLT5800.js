export function OLT5800(snmpInfo, equipmentName, port) {
    if (!snmpInfo) {
        return "<p>Pas d'informations SNMP disponibles</p>";
    }

    const getStatusClassAndText = (value) => {
        if (value == "up") {
            return { class: "carre-vert", text: "active" };
        } else if (value == "2") {
            return { class: "carre-gris", text: "disable" };
        } else {
            return { class: "carre-rouge", text: "inactive" };
        }
    };

    const adminStatus = getStatusClassAndText(snmpInfo["admin status"]);
    const operStatus = getStatusClassAndText(snmpInfo["oper status"]);

    const rxValid = snmpInfo["Validation_Puissance_Optique_RX"] == 1;
    const txValid = snmpInfo["Validation_Puissance_Optique_TX"] == 1;

    const vendor_name = snmpInfo["vendor_name"] ? snmpInfo["vendor_name"].trim() : "";

    let htmlContentOLT5800 = `
        <ul>
            <h2>${equipmentName} # ${port}</h2>
            <table border='0'>
                <tr><td><strong>Port : </strong>${port}</td></tr>
                <tr><td><strong>Type : </strong>${snmpInfo["speed"]}</td></tr>
                <tr>
                    <td>
                        <strong>Admin state :</strong>
                        <span class='${adminStatus.class}'>${adminStatus.text}</span>
                        <strong>Oper state :</strong>
                        <span class='${operStatus.class}'>${operStatus.text}</span>
                    </td>
                </tr>
                <tr><td><strong>Ethernet port MTU : </strong>${snmpInfo["mtu"]} bytes</td></tr>
                <tr><td><strong>Vendor Name : </strong>${vendor_name}</td></tr>
                <tr><td><strong>TX Laser Wavelength : </strong>${snmpInfo["longueur_onde"]}</td></tr>
                <tr><td><strong>Link length support : </strong>${snmpInfo["optical_compliance"]}</td></tr>
                <tr><td><strong>Tx Output Power (dBm) : </strong>
                    <span class='${txValid ? "carre-vert" : "carre-rouge"}'>
                        ${snmpInfo["puissance_optique_TX"]}
                    </span>
                </td></tr>
                <tr><td><strong>Tx power alarm threshold (dBm) :</strong>[${snmpInfo["low_alarm_TX"]}, ${snmpInfo["high_alarm_TX"]}]</td></tr>
                <tr><td><strong>Rx Optical Power (dBm) :</strong>
                    <span class='${rxValid ? "carre-vert" : "carre-rouge"}'>
                        ${snmpInfo["puissance_optique_RX"]}
                    </span>
                </td></tr>
                <tr><td><strong>Rx power alarm threshold :</strong>[${snmpInfo["low_alarm_RX"]}, ${snmpInfo["high_alarm_RX"]}]</td></tr>
            </table>
        </ul>
    `;

    return htmlContentOLT5800;
}
