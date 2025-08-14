import { genererListeNego } from '../Modif_Nego.js';

export function NTE(snmpInfo, equipmentName, port_network, port, snmpNetwork, validation, ip, acces_physique, Command, portNetwork2, snmpNetwork2) {
    if (!snmpNetwork || !snmpInfo) {
        return "<p>Informations SNMP non disponibles</p>";
    }

    let ip_nte = ip;
    let port_nte = port;
    let nego = snmpInfo["speed duplex"] || "Non disponible";
    let type_media = snmpInfo["type media"] || "Non disponible";
    if  (snmpInfo["admin status"] === "Null" && snmpInfo["oper status"] === "Null" ){
        return " "
    }else {
          let htmlContentNTE = `
        <ul>
            <h2>${equipmentName} show : network-port ${port_network}</h2>
            <table border='0'>
                <tr><td><strong>SFP vendor:</strong> ${snmpNetwork["equipementier SFP"] || "Non disponible"}</td></tr>
                <tr><td><strong>TX-Power :</strong> <span class='${validation[1] === 1 ? "carre-vert" : "carre-rouge"}'>${snmpNetwork["puissance optique TX"] || "Non disponible"} dBm</span></td></tr>
                <tr><td><strong>RX-Power :</strong> <span class='${validation[0] === 1 ? "carre-vert" : "carre-rouge"}'>${snmpNetwork["puissance optique RX"] || "Non disponible"} dBm</span></td></tr>
                <tr><td><strong>Longueur d'onde :</strong> ${snmpNetwork["Laser Wave Length"] || "Non disponible"} nm</td></tr>
                <tr><td><strong>Link length :</strong> ${snmpNetwork["Link Length"] || "Non disponible"} km</td></tr>
            </table>

            ${portNetwork2 && snmpNetwork2 ? `
            <h2>${equipmentName} show : network-port ${portNetwork2}</h2>
            <table border='0'>
                <tr><td><strong>TX-Power 2 :</strong> <span class='${validation[1] === 1 ? "carre-vert" : "carre-rouge"}'>${snmpNetwork2["puissance optique TX 2"] || "Non disponible"} dBm</span></td></tr>
                <tr><td><strong>RX-Power 2 :</strong> <span class='${validation[0] === 1 ? "carre-vert" : "carre-rouge"}'>${snmpNetwork2["puissance optique RX 2"] || "Non disponible"} dBm</span></td></tr>
                <tr><td><strong>Longueur d'onde 2 :</strong> ${snmpNetwork2["laser wave length 2"] || "Non disponible"} nm</td></tr>
                <tr><td><strong>Link length 2 :</strong> ${snmpNetwork2["link length 2"] || "Non disponible"} km</td></tr>
            </table>
            ` : ''}

            <h2>${equipmentName} show : access-port ${port}</h2>
            <table border='0'>
                <tr><td><strong>Status admin :</strong> <span class='${snmpInfo["admin status"] === "up" ? "carre-vert" : "carre-rouge"}'>${snmpInfo["admin status"] || "Non disponible"}</span>
                <strong>Oper Status :</strong> <span class='${snmpInfo["oper status"] === "up" ? "carre-vert" : "carre-rouge"}'>${snmpInfo["oper status"] || "Non disponible"}</span></td></tr>
                <tr><td><strong>Alias :</strong> ${snmpInfo["name"] || "Non disponible"}</td></tr>
                <tr><td><strong>MTU (Bytes) :</strong> ${snmpInfo["mtu"] || "Non disponible"}</td></tr>
                <tr><td><strong>Status speed duplex :</strong> ${snmpInfo["status speed duplex"] || "Non disponible"}</td></tr>
                <tr class="carte-row" onclick="toggleNego('${ip}')">
                    <td><strong>Speed duplex :</strong> <span id="speed-duplex-${ip}">${nego}</span> <span class="chevron" id="chevron-${ip}">▶</span></td>
                </tr>
                <tr id="details-${ip}" class="details-row" style="display:none;">
                    <td>
                        <table>
                            <tr><td><strong>Changement de la négociation :</strong></td></tr>
                            <tr><td>${genererListeNego(port_nte, nego, acces_physique, ip_nte)}</td></tr>
                        </table>
                    </td>
                </tr>
                <tr><td><strong>Type de media :</strong> ${type_media}</td></tr>
            </table>
        </ul>
    `;

    if (Command !== null) {
        let commandResults = `
            <style>
                .command-results-wrapper {
                    display: flex;
                    justify-content: center;
                    margin-top: 20px;
                }
                .command-results {
                    max-width: 1000px;
                    width: 100%;
                    text-align: center;
                }
                .command-results pre {
                    font-family: Consolas, "Courier New", monospace;
                    white-space: pre-wrap;
                    word-wrap: break-word;
                    overflow-wrap: break-word;
                    text-align: left;
                    margin: 0;
                }
                .command-results table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 0 auto;
                }
                .command-results th,
                .command-results td {
                    border: 1px solid #ccc;
                    padding: 6px;
                    text-align: center;
                    vertical-align: top;
                }
                .command-section {
                    margin-bottom: 20px;
                }
            </style>
            <h2 style="text-align: center;">Résultats des commandes</h2>
            <div class="command-results-wrapper">
                <div class="command-results">
        `;

        if (Array.isArray(Command)) {
            Command.forEach((commandGroup) => {
                if (Array.isArray(commandGroup)) {
                    commandGroup.forEach((command) => {
                        if (typeof command === "object") {
                            Object.entries(command).forEach(([commandSent, commandDetails]) => {
                                const rawOutput = Array.isArray(commandDetails["Retour de la commande "])
                                    ? commandDetails["Retour de la commande "]
                                    : [];

                                const cleanedOutput = rawOutput
                                    .map(line => line.trim().replace(/\s{2,}/g, ' '))
                                    .join('\n');

                                const commandReturn = cleanedOutput || "Aucun retour disponible";

                                commandResults += `
                                    <div class="command-section">
                                        <table>
                                            <tr>
                                                <th>Commande : ${commandSent}</th>
                                            </tr>
                                            <tr>
                                                <td><pre>${commandReturn}</pre></td>
                                            </tr>
                                        </table>
                                    </div>
                                `;
                            });
                        }
                    });
                }
            });
        } else {
            commandResults += "<p>Aucune commande disponible pour cet équipement.</p>";
        }

        commandResults += `
                </div>
            </div>
        `;

        return htmlContentNTE + commandResults;
    } else {
        return htmlContentNTE;
    }
    }
  
}

window.toggleNego = function (ip) {
    const detailsRow = document.getElementById(`details-${ip}`);
    const chevron = document.getElementById(`chevron-${ip}`);

    if (detailsRow && chevron) {
        if (!detailsRow.classList.contains('active')) {
            detailsRow.style.display = "table-row";
            detailsRow.classList.add('active');
            chevron.classList.add('down');
        } else {
            detailsRow.style.display = "none";
            detailsRow.classList.remove('active');
            chevron.classList.remove('down');
        }
    }
};
