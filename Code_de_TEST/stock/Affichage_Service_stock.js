import * as Function from './service.js';
import { genererListeNego } from './Modif_Nego.js';

export function afficherOAM(dataToDisplay, ip) {

    let htmlContent = "";

    for (var i = 0; i < dataToDisplay.length; i++) {
        var Oam = dataToDisplay[i]["oam"] || {};
        var OamLivraison = dataToDisplay[i]["Oam livraison"] || {};


        let IP_OAM = Oam["ip_equipement"];

       
        if (ip.includes(IP_OAM)) {

            if (Oam && Oam["OAM_ADVA"] !== undefined) {
                let classOAM = Oam["OAM_ADVA"].includes("KO") ? "surligneR" : "surligne";
                htmlContent += '<h2><strong class="' + classOAM + '">' + "OAM NTE : " + Oam["OAM_ADVA"] + '</strong></h2>';
            }
            if(Oam && Oam["OAM_IXEN"] !== undefined){
                let classOAM = Oam["OAM_IXEN"].includes("KO") ? "surligneR" : "surligne";
                htmlContent += '<h2><strong class="' + classOAM + '">' + "OAM NTE : " + Oam["OAM_IXEN"] + '</strong></h2>'; 
            }

            if (Oam && Oam["PRESENCE_SFP"] !== undefined) {
                htmlContent += '<h2><strong>' + Oam["PRESENCE_SFP"] + '</strong></h2>';
            }

            if (OamLivraison && OamLivraison["OAM_LIVRAISON"] !== undefined) {
                let classOAMLivraison = OamLivraison["OAM_LIVRAISON"].includes("KO") ? "surligneR" : "surligne";
                htmlContent += '<h2><strong class="' + classOAMLivraison + '">' + "OAM Livraison : " + OamLivraison["OAM_LIVRAISON"] + '</strong></h2>';
            }
        }
    }

    return htmlContent;
}

 
export  function validationDonnee(dataToDisplay, verifNTE) {
    for (var i = 0; i < dataToDisplay.length; i++) {
        if (!dataToDisplay[i]["equipment name"]) {
            continue;
        }
        
        var equipmentName = dataToDisplay[i]["equipment name"];
        var equipmentInfo = dataToDisplay[i]["equipment_info"];
        var parts = equipmentName.split("-");
        var verif = parts[1];
        
        if (verifNTE == verif) {
            var snmpInfo = dataToDisplay[i]["snmp info"];
            if (equipmentName.toLowerCase().includes("olt")) {
                if (equipmentInfo["equipment type"]=="MA5800"){
                    var validationRX = snmpInfo["Validation puissance RX"];
                    var validationTX = snmpInfo["Validation puissance TX"];

                }else{
                    var equipmentInfo = dataToDisplay[i]["equipment_info"];
                    var sshInfo = dataToDisplay[i]["ssh info"];
                    let puissanceTX = parseFloat(sshInfo[0]["tx-power"]);
                    let highAlarmTX = parseFloat(sshInfo[3]["tx-pwr-alm-high"]);
                    let lowAlarmTX = parseFloat(sshInfo[3]["tx-pwr-alm-low"]);
            
                    let puissanceRX = parseFloat(sshInfo[0]["rx-power"]);
                    let highAlarmRX = parseFloat(sshInfo[3]["rx-pwr-alm-high"]);
                    let lowAlarmRX = parseFloat(sshInfo[3]["rx-pwr-alm-low"]);
                    
            
                    validationTX = (puissanceTX >= lowAlarmTX && puissanceTX <= highAlarmTX) ? 1 : 0;
            
                    validationRX = (puissanceRX >= lowAlarmRX && puissanceRX <= highAlarmRX) ? 1 : 0;
                }

                return [validationRX, validationTX];
            
            }
            if (equipmentName.toLowerCase().includes("edg")) {
                var validationTX = snmpInfo["Validation puissance TX"];
                var validationRX = snmpInfo["Validation puissance RX"];
                return [validationRX, validationTX];
            }
            if (equipmentName.toLowerCase().includes("cor")) {
                var validationTX = snmpInfo["Validation puissance TX"];
                var validationRX = snmpInfo["Validation puissance RX"];
                return [validationRX, validationTX];
            }
        }
    }
    return ["1", "1"];
}
    
export function afficherEDG(snmpInfo, equipmentName, ip) {
    if (!snmpInfo) {
        return "<p>Pas d'informations SNMP disponibles</p>";
    }

    let htmlContent = `
        <ul>
            <h2>${equipmentName} # ${snmpInfo["description"] || "ethernet-line " + ip }</h2>
            <table border='0'>
                <tr><td><strong>Interface :</strong></td><td>${ip || "Non disponible"}</td></tr>
                <tr><td><strong>Oper Speed :</strong></td><td>${snmpInfo["speed"] || "Non disponible"}</td></tr>
                <tr><td><strong>Config Speed :</strong></td><td>${snmpInfo["speed"] || "Non disponible"}</td></tr>
                <tr><td><strong>Admin state :</strong></td><td><span class='${snmpInfo["admin status"] === "up" ? "carre-vert" : "carre-rouge"}'>${snmpInfo["admin status"] || "Non disponible"}</span></td></tr>
                <tr><td><strong>Oper state :</strong></td><td><span class='${snmpInfo["oper status"] === "up" ? "carre-vert" : "carre-rouge"}'>${snmpInfo["oper status"] || "Non disponible"}</span></td></tr>
                <tr><td><strong>MTU :</strong></td><td>${snmpInfo["mtu"] || "Non disponible"}</td></tr>
                <tr><td><strong>Transceiver Type :</strong></td><td>${snmpInfo["type_sfp"] || "Non disponible"}</td></tr>
                <tr><td><strong>TX laser wavelength :</strong></td><td>${snmpInfo["longueur_onde"] || "Non disponible"} nm</td></tr>
                <tr><td><strong>Connector Code :</strong></td><td>${snmpInfo["type_connecteur"] || "Non disponible"}</td></tr>
            </table>

            <p></p>
            <table border='0'>
                <tr><td></td><td><strong>Value</strong></td><td><strong>High Alarm</strong></td><td><strong>High Warn</strong></td><td><strong>Low Warn</strong></td><td><strong>Low Alarm</strong></td></tr>
                
                <!-- Tx Power -->
                <tr>
                    <td><strong>Tx Output Power (dBm)</strong></td>
                    <td><span class='${snmpInfo["Validation puissance TX"] == "1" ? "carre-vert" : "carre-rouge"}'>${snmpInfo["puissance_optique_TX"] || "Non disponible"}</span></td>
                    <td>${snmpInfo["high_alarm_TX"] || "Non disponible"}</td>
                    <td>${snmpInfo["high_warning_TX"] || "Non disponible"}</td>
                    <td>${snmpInfo["low_warning_TX"] || "Non disponible"}</td>
                    <td>${snmpInfo["low_alarm_TX"] || "Non disponible"}</td>
                </tr>

                <!-- Rx Power -->
                <tr>
                    <td><strong>Rx Optical Power (dBm)</strong></td>
                    <td><span class='${snmpInfo["Validation puissance RX"] == "1" ? "carre-vert" : "carre-rouge"}'>${snmpInfo["puissance_optique_RX"] || "Non disponible"}</span></td>
                    <td>${snmpInfo["high_alarm_RX"] || "Non disponible"}</td>
                    <td>${snmpInfo["high_warning_RX"] || "Non disponible"}</td>
                    <td>${snmpInfo["low_warning_RX"] || "Non disponible"}</td>
                    <td>${snmpInfo["low_alarm_RX"] || "Non disponible"}</td>
                </tr>
            </table>
        </ul>
    `;

    return htmlContent;
}

export function afficherNTE(snmpInfo, equipmentName, port_network, port, snmpNetwork, validation, ip, acces_physique, dataToDisplay) {

    let ip_nte = ip;
    let port_nte = port;
    let nego = snmpInfo["speed duplex"] || "Non disponible";
    let type_media = snmpInfo["type media"] || "Non disponible";
    
    if (!snmpNetwork || !snmpInfo) {
        return "<p>Informations SNMP non disponibles</p>";
    }

    let htmlContentNTE = `
        <ul>
            <h2>${equipmentName} show : network-port ${port_network}</h2>
            <table border='0'>
                <tr><td><strong>SFP vendor :</strong></td><td>${snmpNetwork["equipementier SFP"] || "Non disponible"}</td></tr>
                
                <!-- Puissance TX -->
                <tr>
                    <td><strong>TX-Power :</strong></td>
                    <td><span class='${validation[1] == "1" ? "carre-vert" : "carre-rouge"}'>${snmpNetwork["puissance optique TX"] || "Non disponible"} dBm</span></td>
                </tr>
                
                <!-- Puissance RX -->
                <tr>
                    <td><strong>RX-Power :</strong></td>
                    <td><span class='${validation[0] == "1" ? "carre-vert" : "carre-rouge"}'>${snmpNetwork["puissance optique RX"] || "Non disponible"} dBm</span></td>
                </tr>
                
                <tr><td><strong>Longueur d'onde :</strong></td><td>${snmpNetwork["Laser Wave Length"] || "Non disponible"} nm</td></tr>
                <tr><td><strong>Link length :</strong></td><td>${snmpNetwork["Link Length"] || "Non disponible"} km</td></tr>
            </table>

            <h2>${equipmentName} show : access-port ${port}</h2>
            <table border='0'>
                <!-- Status Admin -->
                <tr>
                    <td><strong>Status admin :</strong></td>
                    <td><span class='${snmpInfo["admin status"] === "up" ? "carre-vert" : "carre-rouge"}'>${snmpInfo["admin status"] || "Non disponible"}</span></td>
                </tr>
                
                <!-- Status Oper -->
                <tr>
                    <td><strong>Oper Status :</strong></td>
                    <td><span class='${snmpInfo["oper status"] === "up" ? "carre-vert" : "carre-rouge"}'>${snmpInfo["oper status"] || "Non disponible"}</span></td>
                </tr>

                <tr><td><strong>Alias :</strong></td><td>${snmpInfo["name"] || "Non disponible"}</td></tr>
                <tr><td><strong>MTU (Bytes) :</strong></td><td>${snmpInfo["mtu"] || "Non disponible"}</td></tr>
                <tr><td><strong>Status speed duplex :</strong></td><td>${snmpInfo["status speed duplex"] || "Non disponible"}</td></tr>
                
                <!-- Modification de la négociation -->
                <tr><td><strong>Modification Négociation :</strong></td><td>${genererListeNego(port_nte, nego, acces_physique, ip_nte)}</td></tr>
                
                <tr><td><strong>Speed duplex :</strong></td><td id='status-speed-duplex'>${nego}</td></tr>
                <tr><td><strong>Type de media :</strong></td><td>${type_media}</td></tr>
            </table>
        </ul>
    `;

    return htmlContentNTE;
}

export function afficherOLT(ip, sshInfo, equipmentName) {
    let htmlContentOLT = `
        <ul>
            <h2>${equipmentName} # ${ip}</h2>
            ${sshInfo ? `
                <table border='0'>
                    <tr>
                        <td><strong>Status admin :</strong></td>
                        <td><span class='${sshInfo[1]["admin-status"] === "up" ? "carre-vert" : "carre-rouge"}'>${sshInfo[1]["admin-status"]}</span></td>
                        <td><strong>Wavelength :</strong></td><td>${sshInfo[2]["tx-wavelength"]}</td>
                    </tr>
                    <tr>
                        <td><strong>Oper Status :</strong></td>
                        <td><span class='${sshInfo[1]["opr-status"] === "up" ? "carre-vert" : "carre-rouge"}'>${sshInfo[1]["opr-status"]}</span></td>
                        <td>${sshInfo[4]["sense"]}</td>
                    </tr>
                    <tr>
                        <td><strong>Type :</strong></td><td>${sshInfo[4]["type_ethernet_line"]}</td>
                        <td><strong>High speed :</strong></td><td>${sshInfo[1]["high-speed"]} ${sshInfo[4]["nego"]}</td>
                    </tr>
                    <tr>
                        <td><strong>Mfg-name :</strong></td><td>${sshInfo[2]["mfg-name"]}</td>
                        <td><strong>Serial-num :</strong></td><td>${sshInfo[2]["vendor-serial-num"]}</td>
                    </tr>
                    <tr>
                        <td><strong>Tx-fault :</strong></td><td>${sshInfo[0]["tx-fault"]}</td>
                        <td>${sshInfo[0]["los"]}</td>
                    </tr>
                    <tr>
                        <td><strong>Diag-avail-status :</strong></td><td>${sshInfo[0]["diag-avail-status"]}</td>
                    </tr>
                    <tr>
                        <td><strong>Largest-pkt-size :</strong></td><td>${sshInfo[1]["largest-pkt-size"]}</td>
                    </tr>
                    <tr>
                        <td><strong>Connector-present :</strong></td><td>${sshInfo[1]["connector-present"]}</td>
                    </tr>
                    <tr>
                        <td><strong>Las-chg-opr-stat :</strong></td><td>${sshInfo[1]["last-chg-opr-stat"]}</td>
                    </tr>
                </table>
                <p></p>
                <table border='0'>
                    <tr><td></td><td><strong>Value</strong></td><td><strong>High Alarm</strong></td><td><strong>Low Alarm</strong></td></tr>
                    ${parseFloat(sshInfo[0]["tx-power"]) >= parseFloat(sshInfo[3]["tx-pwr-alm-low"]) && parseFloat(sshInfo[0]["tx-power"]) <= parseFloat(sshInfo[3]["tx-pwr-alm-high"]) ?
                        `<tr><td><strong>Tx-power</strong></td><td><span class='carre-vert'>${sshInfo[0]["tx-power"]}</span></td><td>${sshInfo[3]["tx-pwr-alm-high"]}</td><td>${sshInfo[3]["tx-pwr-alm-low"]}</td></tr>` :
                        `<tr><td><strong>Tx-power</strong></td><td><span class='carre-rouge'>${sshInfo[0]["tx-power"]}</span></td><td>${sshInfo[3]["tx-pwr-alm-high"]}</td><td>${sshInfo[3]["tx-pwr-alm-low"]}</td></tr>`
                    }
                    ${parseFloat(sshInfo[0]["rx-power"]) >= parseFloat(sshInfo[3]["rx-pwr-alm-low"]) && parseFloat(sshInfo[0]["rx-power"]) <= parseFloat(sshInfo[3]["rx-pwr-alm-high"]) ?
                        `<tr><td><strong>Rx-power</strong></td><td><span class='carre-vert'>${sshInfo[0]["rx-power"]}</span></td><td>${sshInfo[3]["rx-pwr-alm-high"]}</td><td>${sshInfo[3]["rx-pwr-alm-low"]}</td></tr>` :
                        `<tr><td><strong>Rx-power</strong></td><td><span class='carre-rouge'>${sshInfo[0]["rx-power"]}</span></td><td>${sshInfo[3]["rx-pwr-alm-high"]}</td><td>${sshInfo[3]["rx-pwr-alm-low"]}</td></tr>`
                    }
                </table>
                <p></p>
                <table border='0'>
                    <tr><td><strong>in-octets</strong></td><td>${sshInfo[1]["in-octets"]}</td><td><strong>out-octets</strong></td><td>${sshInfo[1]["out-octets"]}</td></tr>
                    <tr><td><strong>in-ucast-pkts</strong></td><td>${sshInfo[1]["in-ucast-pkts"]}</td><td><strong>out-ucast-pkts</strong></td><td>${sshInfo[1]["out-ucast-pkts"]}</td></tr>
                    <tr><td><strong>in-mcast-pkts</strong></td><td>${sshInfo[1]["in-mcast-pkts"]}</td><td><strong>out-mcast-pkts</strong></td><td>${sshInfo[1]["out-mcast-pkts"]}</td></tr>
                    <tr><td><strong>in-broadcast-pkts</strong></td><td>${sshInfo[1]["in-broadcast-pkts"]}</td><td><strong>out-broadcast-pkts</strong></td><td>${sshInfo[1]["out-broadcast-pkts"]}</td></tr>
                    <tr><td><strong>in-discard-pkts</strong></td><td>${sshInfo[1]["in-discard-pkts"]}</td><td><strong>out-discard-pkts</strong></td><td>${sshInfo[1]["out-discard-pkts"]}</td></tr>
                    <tr><td><strong>in-err-pkts</strong></td><td>${sshInfo[1]["in-err-pkts"]}</td><td><strong>out-err-pkts</strong></td><td>${sshInfo[1]["out-err-pkts"]}</td></tr>
                    <tr><td><strong>in-octets-hc</strong></td><td>${sshInfo[1]["in-octets-hc"]}</td><td><strong>out-octets-hc</strong></td><td>${sshInfo[1]["out-octets-hc"]}</td></tr>
                </table>
                <p></p>
            ` : ""}
        </ul>
    `;
    return htmlContentOLT;
}

export function afficherOLT5800(snmpInfo, equipmentName, port, vendor_name) {
    let htmlContentOLT5800 = `
        <ul>
            <h2>${equipmentName}</h2>
            ${snmpInfo ? `
                <table border='0'>
                    <tr><td><strong>Port :</strong></td><td>${port}</td></tr>
                    <tr><td><strong>Type :</strong></td><td>${snmpInfo["speed"]}</td></tr>
                    <tr><td><strong>Admin state :</strong></td><td>
                        <span class='${snmpInfo["admin status"] === "up" ? "carre-vert" : "carre-rouge"}'>
                            ${snmpInfo["admin status"] === "up" ? "active" : "inactive"}
                        </span>
                    </td></tr>
                    <tr><td><strong>Ethernet port MTU :</strong></td><td>${snmpInfo["mtu"]} bytes</td></tr>
                    <tr><td><strong>Vendor Name :</strong></td><td>${vendor_name}</td></tr>
                    <tr><td><strong>Link length support :</strong></td><td>à implémenter</td></tr>
                    <tr><td><strong>Tx Output Power (dBm) :</strong></td><td>
                        <span class='${snmpInfo["Validation puissance TX"] == "1" ? "carre-vert" : "carre-rouge"}'>
                            ${snmpInfo["puissance_optique_TX"]}
                        </span>
                    </td></tr>
                    <tr><td><strong>Tx power alarm threshold (dBm) :</strong></td><td>[${snmpInfo["low_alarm_TX"]}, ${snmpInfo["high_alarm_TX"]}]</td></tr>
                    <tr><td><strong>Rx Optical Power (dBm) :</strong></td><td>
                        <span class='${snmpInfo["Validation puissance RX"] == "1" ? "carre-vert" : "carre-rouge"}'>
                            ${snmpInfo["puissance_optique_RX"]}
                        </span>
                    </td></tr>
                    <tr><td><strong>Rx power alarm threshold :</strong></td><td>[${snmpInfo["low_alarm_RX"]}, ${snmpInfo["high_alarm_RX"]}]</td></tr>
                </table>
            ` : ""}
        </ul>
    `;
    return htmlContentOLT5800;
}
    
export function afficherSWA(equipmentName, port, snmpInfo, snmpNetwork) {
    let duplexmode = snmpInfo && snmpInfo["status speed duplex"] ? snmpInfo["status speed duplex"].split("-")[0] : "Non disponible";
    let htmlContentSWA = `
        <ul>
            <h2>${equipmentName} #show interface ${port} :</h2>
            ${snmpInfo ? `
                <table border='0'>
                    <tr><td><strong>Name :</strong></td><td>${snmpInfo["name"] || "Non disponible"}</td></tr>
                    <tr><td><strong>EnableState :</strong></td><td>Non implémenté</td></tr>
                    <tr><td><strong>Link :</strong></td><td>Non implémenté</td></tr>
                    <tr><td><strong>Duplex mode :</strong></td><td>${duplexmode}</td></tr>
                    <tr><td><strong>Speed :</strong></td><td>${snmpInfo["speed duplex"] || "Non disponible"}</td></tr>
                    <tr><td><strong>Duplex speed status :</strong></td><td>${snmpInfo["status speed duplex"] || "Non disponible"}</td></tr>
                    <tr>
                        <td><strong>TX-power :</strong></td>
                        <td><span class='carre-vert'>${snmpNetwork["puissance optique TX"] || "Non disponible"} dBm</span></td>
                    </tr>
                    <tr>
                        <td><strong>Rx-power :</strong></td>
                        <td><span class='carre-vert'>${snmpNetwork["puissance optique RX"] || "Non disponible"} dBm</span></td>
                    </tr>
                </table>
            ` : `<p>Pas d'informations disponibles</p>`}
        </ul>
    `;
    
    return htmlContentSWA;
}

export function afficherCOR(equipmentName, snmpInfo, port) {
    var htmlContentCOR = "<ul>";
    htmlContentCOR += "<h2>" + equipmentName + " # " + snmpInfo["description"] + "</h2>";

    if (snmpInfo) {
        htmlContentCOR += "<table border='0'>";
        htmlContentCOR += "<tr><td><strong>Interface :</strong></td><td>"+port+" </td></tr>";
        htmlContentCOR += "<tr><td><strong>Oper Speed :</strong></td><td>" + snmpInfo["speed"] + "</td></tr>";
        htmlContentCOR += "<tr><td><strong>Config Speed :</strong></td><td>" + snmpInfo["speed"] + "</td></tr>";
        if (snmpInfo["admin status"] == "up") {
            htmlContentCOR += "<tr><td><strong>Admin state :</strong></td><td><span class='carre-vert'>" + snmpInfo["admin status"] + "</span class='carre-vert'></td></tr>";
        } else {
            htmlContentCOR += "<tr><td><strong>Admin state :</strong></td><td><span class='carre-rouge'>" + snmpInfo["admin status"] + "</span class='carre-rouge'></td></tr>";
        }
        if (snmpInfo["oper status"] == "up") {
            htmlContentCOR += "<tr><td><strong>Oper state :</strong></td><td><span class='carre-vert'>" + snmpInfo["oper status"] + "</span class='carre-vert'></td></tr>";
        } else {
            htmlContentCOR += "<tr><td><strong>Oper state :</strong></td><td><span class='carre-rouge'>" + snmpInfo["oper status"] + "</span class='carre-rouge'></td></tr>";
        }
        htmlContentCOR += "<tr><td><strong>MTU :</strong></td><td>" + snmpInfo["mtu"] + "</td></tr>";
        htmlContentCOR += "<tr><td><strong>Transceiver Type :</strong></td><td>" + snmpInfo["type_sfp"] + "</td></tr>";
        htmlContentCOR += "<tr><td><strong>TX laser wavelength :</strong></td><td>" + snmpInfo["longueur_onde"] + "</td></tr>";
        htmlContentCOR += "<tr><td><strong>Connector Code :</strong></td><td>" + snmpInfo["type_connecteur"] + "</td></tr>";
        htmlContentCOR += "</table>";
        htmlContentCOR += "<p> </p>";

        htmlContentCOR += "<table border='0'>";
        htmlContentCOR += "<tr><td></td><td><strong>Value</strong></td><td><strong>High Alarm</strong></td><td><strong>High Warn</strong></td><td><strong>Low warn</strong></td><td><strong>Low alarm</strong></td></tr>";
        if (snmpInfo["Validation puissance TX"] == "1") {
            htmlContentCOR += "<tr><td><strong>Tx Output Power (dBm)</strong></td><td><span class='carre-vert'>" + snmpInfo["puissance_optique_TX"] + "</span class='carre-vert'></td><td>" + snmpInfo["high_alarm_TX"] + "</td><td>" + snmpInfo["high_warning_TX"] + "</td><td>" + snmpInfo["low_warning_TX"] + "</td><td>" + snmpInfo["low_alarm_TX"] + "</td></tr>";
        } else {
            htmlContentCOR += "<tr><td><strong>Tx Output Power (dBm)</strong></td><td><span class='carre-rouge'>" + snmpInfo["puissance_optique_TX"] + "</span class='carre-rouge'></td><td>" + snmpInfo["high_alarm_TX"] + "</td><td>" + snmpInfo["high_warning_TX"] + "</td><td>" + snmpInfo["low_warning_TX"] + "</td><td>" + snmpInfo["low_alarm_TX"] + "</td></tr>";
        }
        if (snmpInfo["Validation puissance RX"] == "1") {
            htmlContentCOR += "<tr><td><strong>Rx Optical Power (dBm)</strong></td><td><span class='carre-vert'>" + snmpInfo["puissance_optique_RX"] + "</span class='carre-vert'></td><td>" + snmpInfo["high_alarm_RX"] + "</td><td>" + snmpInfo["high_warning_RX"] + "</td><td>" + snmpInfo["low_warning_RX"] + "</td><td>" + snmpInfo["low_alarm_RX"] + "</td></tr>";
        } else {
            htmlContentCOR += "<tr><td><strong>Rx Optical Power (dBm)</strong></td><td><span class='carre-rouge'>" + snmpInfo["puissance_optique_RX"] + "</span class='carre-rouge'></td><td>" + snmpInfo["high_alarm_RX"] + "</td><td>" + snmpInfo["high_warning_RX"] + "</td><td>" + snmpInfo["low_warning_RX"] + "</td><td>" + snmpInfo["low_alarm_RX"] + "</td></tr>";
        }
        htmlContentCOR += "</table>";
        htmlContentCOR += "</ul>";
    }
    htmlContentCOR += "</ul>";
    return htmlContentCOR;
}

export function afficherVPLS(equipmentName, idTechnique, adressesMAC) {
    if (!adressesMAC || adressesMAC.length === 0) {
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

    adressesMAC.forEach(adresse => {
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

export function afficherFTTH(dataToDisplay) {
    if (!dataToDisplay || dataToDisplay.length === 0) {
        return "<p>Aucune donnée à afficher.</p>";
    }

    const snmpInfoAd = dataToDisplay[0]["Snmp info additionel"];
    const snmpInfo = dataToDisplay[0]["Snmp info"];

    // Création du contenu HTML
    let htmlContentFTTH = `
        <ul>
            <h2>Dossier immeuble</h2>
            <table border='0'>
                <tr>
                    <td><strong>Adresse :</strong></td>
                    <td>${snmpInfoAd["numero_voie"] || "Non disponible"} ${snmpInfoAd["type_voie"] || ""} ${snmpInfoAd["libelle_voie"] || ""} ${snmpInfoAd["code_postal"] || ""} ${snmpInfoAd["commune"] || ""}</td>
                </tr>
            </table>
            <table border='0'>
                <tr>
                    <td><strong>Escalier :</strong></td>
                    <td>${snmpInfoAd["escalier"] || "Non disponible"}</td>
                    <td><strong>Bâtiment</strong></td>
                    <td>${snmpInfoAd["batiment"] || "Non disponible"}</td>
                    <td><strong>Étage</strong></td>
                    <td>${snmpInfoAd["etage"] || "Non disponible"}</td>
                </tr>
                <tr>
                    <td><strong>Code adresse</strong></td>
                    <td>${snmpInfoAd["code_adresse"] || "Non disponible"}</td>
                </tr>
            </table>
            <h2>Gestion PM/PBO/PTO</h2>
            <table border='0'>
                <tr>
                    <td><strong>Ref PM:</strong></td>
                    <td>${snmpInfoAd["reference_pm_commande"] || "Non disponible"}</td>
                </tr>
                <tr>
                    <td><strong>Nom Module PM :</strong></td>
                    <td>${snmpInfoAd["nom_module_pm"] || "Non disponible"}</td>
                    <td><strong>Position Module PM:</strong></td>
                    <td>${snmpInfoAd["position_module_pm"] || "Non disponible"}</td>
                </tr>
                <tr>
                    <td><strong>Ref Cable Module PM:</strong></td>
                    <td>${snmpInfoAd["ref_cable_module_pm"] || "Non disponible"}</td>
                </tr>`;


    const partTube = (snmpInfoAd["info_tube_module_pm"] || "").split(":");
    const partFibre = (snmpInfoAd["info_fibre_module_pm"] || "").split(":");
    const partTubePbo = (snmpInfoAd["info_tube_pbo"] || "").split(":");
    const partFibrePbo = (snmpInfoAd["info_fibre_pbo"] || "").split(":");

    htmlContentFTTH += `
                <tr>
                    <td><strong>Num Tube Module PM :</strong></td>
                    <td>${partTube[0] || "Non disponible"}</td>
                    <td><strong>Couleur Tube Module PM :</strong></td>
                    <td>${partTube[1] || "Non disponible"}</td>
                </tr>
                <tr>
                    <td><strong>Num Fibre Module PM:</strong></td>
                    <td>${partFibre[0] || "Non disponible"}</td>
                    <td><strong>Couleur Fibre Module PM:</strong></td>
                    <td>${partFibre[1] || "Non disponible"}</td>
                </tr>
                <tr>
                    <td><strong>Ref PBO :</strong></td>
                    <td>${snmpInfoAd["ref_pbo"] || "Non disponible"}</td>
                </tr>
                <tr>
                    <td><strong>Num Tube PBO</strong></td>
                    <td>${partTubePbo[0] || "Non disponible"}</td>
                    <td><strong>Couleur Tube PBO :</strong></td>
                    <td>${partTubePbo[1] || "Non disponible"}</td>
                </tr>
                <tr>
                    <td><strong>Num Fibre PBO</strong></td>
                    <td>${partFibrePbo[0] || "Non disponible"}</td>
                    <td><strong>Couleur Fibre PBO :</strong></td>
                    <td>${partFibrePbo[1] || "Non disponible"}</td>
                </tr>
                <tr>
                    <td><strong>Connecteur Prise Numero:</strong></td>
                    <td>${snmpInfoAd["connecteur_prise_numero"] || "Non disponible"}</td>
                    <td><strong>Couleur Connecteur Prise :</strong></td>
                    <td>${snmpInfoAd["connecteur_prise_couleur"] || "Non disponible"}</td>
                </tr>
                <tr>
                    <td><strong>Ref PTO</strong></td>
                    <td>${snmpInfoAd["ref_prise_cr"] || "Non disponible"}</td>
                </tr>
            </table>
            <h2>Gestion OLT</h2>
            <table border='0'>
                <tr>
                    <td><strong>OLT :</strong></td>
                    <td>${dataToDisplay[0]["Olt"] || "Non disponible"}</td>
                </tr>
                <tr>
                    <td><strong>Slot :</strong></td>
                    <td>${dataToDisplay[0]["Slot"] || "Non disponible"}</td>
                </tr>
                <tr>
                    <td><strong>Port :</strong></td>
                    <td>${dataToDisplay[0]["Port"] || "Non disponible"}</td>
                </tr>
                <tr>
                    <td><strong>ONU ID:</strong></td>
                    <td>${dataToDisplay[0]["Onu_id"] || "Non disponible"}</td>
                </tr>
            </table>
            <h2>Validation actif</h2>
            <table border='0'>`;

    const adminState = snmpInfo["Admin state"] === null ? "Non disponible" : snmpInfo["Admin state"];
    const operState = snmpInfo["oper state"];

    htmlContentFTTH += `
                <tr>
                    <td><strong>Admin/Oper State PON</strong></td>
                    <td>
                        <span class='${adminState === "Non disponible" ? "carre-rouge" : (adminState === "up" ? "carre-vert" : "carre-rouge")}'>${adminState}</span>
                        <span class='${operState === "down" ? "carre-rouge" : "carre-vert"}'>${operState}</span>
                    </td>
                </tr>
                <tr><td><strong>Slid</strong></td><td>${snmpInfo["slid"] || "Non disponible"}</td></tr>
                <tr><td><strong>Num de série</strong></td><td>${snmpInfo["serial number"] || "Non disponible"}</td></tr>
                <tr><td><strong>Version Software</strong></td><td>${snmpInfo["version"] || "Non disponible"}</td></tr>
                <tr><td><strong>Version Hardware</strong></td><td>${snmpInfo["version hardware"] || "Non disponible"}</td></tr>
                <tr><td><strong>Type ONT</strong></td><td>${snmpInfo["type ont"] || "Non disponible"}</td></tr>
                <tr><td><strong>Statut de l'ONT</strong></td><td><span class='carre-vert'>${snmpInfo["Status ont"] || "Non disponible"}</span></td></tr>
                <tr><td><strong>Rx Power ONT venant de l'OLT</strong></td><td>${snmpInfo["rx signal level ont"] || "Non disponible"} dBm</td></tr>
                <tr><td><strong>Tx Power ONT allant vers L'OLT</strong></td><td>${snmpInfo["tx signal level ont"] || "Non disponible"} dBm</td></tr>
                <tr><td><strong>Rx Power OLT venant de l'ONT</strong></td><td>${snmpInfo["rx sig level olt"] || "Non disponible"} dBm</td></tr>
                <tr><td><strong>Distance</strong></td><td>${snmpInfo["distance"] || "Non disponible"} km</td></tr>
                <tr><td><strong>MAC box</strong></td><td>${snmpInfo["mac subscriber id"] || "Non disponible"}</td></tr>
            </table>
            <h2>Validation BNG</h2>
            <table border='0'>
                <tr><td><strong>Status Subscriber</strong></td><td>${snmpInfo["status subscriber id"] || "Non disponible"}</td></tr>
                <tr><td><strong>Attribut class reçu</strong></td><td>${snmpInfo["sla subscriber id"] || "Non disponible"}</td></tr>
                <tr><td><strong>IP</strong></td><td>${snmpInfo["ip subscriber id"] || "Non disponible"}</td></tr>
                <tr><td><strong>MAC</strong></td><td>${snmpInfo["mac subscriber id"] || "Non disponible"}</td></tr>
            </table>
        </ul>`;

    rectangleDonnee.innerHTML = htmlContentFTTH;
}
