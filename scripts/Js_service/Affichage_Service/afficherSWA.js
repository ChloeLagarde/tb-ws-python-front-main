export function SWA(equipmentName, port, snmpInfo, snmpNetwork) {
    let duplexmode = snmpInfo && snmpInfo["status speed duplex"] ? snmpInfo["status speed duplex"].split("-")[0] : "Non disponible";
    let vitesse = snmpInfo && snmpInfo["status speed duplex"] ? snmpInfo["status speed duplex"].split("-")[1] : "Non disponible";
    let Enable_State = "";
    let Link = "";
    if (snmpInfo["admin status"] == "up"){
        Enable_State = "enable";
    }else{
        Enable_State = "disable";
    }

    if (snmpInfo["oper status"]=="up"){
        Link = "UP";
    } else {
        Link = "DOWN";
    }

    let htmlContentSWA = `
        <ul>
            <h2>${equipmentName} #show interface ${port} :</h2>
            ${snmpInfo ? `
                <table border='0'>
                    <tr><td><strong>Name : </strong>${snmpInfo["name"] || "Non disponible"}</td></tr>
                    <td><tr><td><strong>EnableState :</strong><span class='${Enable_State === "enable" ? "carre-vert" : "carre-rouge"}'>${Enable_State || "Non disponible"}</span>
                    <tr><td><strong>Link : </strong><span class='${Link === "UP" ? "carre-vert" : "carre-rouge"}'>${Link || "Non disponible"}</span></td>
                    <tr><td><strong>Duplex mode : </strong>${duplexmode}</td></tr>
                    <tr><td><strong>Speed : </strong>${vitesse || "Non disponible"}</td></tr>
                    <tr><td><strong>Duplex speed status : </strong>${snmpInfo["status speed duplex"] || "Non disponible"}</td></tr>
                    <tr>
                        <td><strong>TX-power : </strong><span class='carre-vert'>${snmpNetwork["Validation_Puissance_Optique_TX"] || "Non disponible"} dBm</span></td>
                    </tr>
                    <tr>
                        <td><strong>Rx-power :< /strong><span class='carre-vert'>${snmpNetwork["Validation_Puissance_Optique_RX"] || "Non disponible"} dBm</span></td>
                    </tr>
                </table>
            ` : `<p>Pas d'informations disponibles</p>`}
        </ul>
    `;
    return htmlContentSWA;
}
