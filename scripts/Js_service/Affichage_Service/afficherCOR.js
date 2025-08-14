export function COR(equipmentName, snmpInfo, port) {
    var htmlContentCOR = "<ul>";
    htmlContentCOR += "<h2>" + equipmentName + " # " + snmpInfo["description"] + "</h2>";

    if (snmpInfo) {
        htmlContentCOR += "<table border='0'>";
        htmlContentCOR += "<tr><td><strong>Interface : </strong>"+port+" </td></tr>";
        htmlContentCOR += "<tr><td><strong>Oper Speed : </strong>" + snmpInfo["speed"] + "</td></tr>";
        htmlContentCOR += "<tr><td><strong>Config Speed : </strong>" + snmpInfo["speed"] + "</td></tr>";
        if (snmpInfo["admin status"] == "up") { 
            htmlContentCOR += "<tr><td><strong>Admin state : </strong><span class='carre-vert'>" + snmpInfo["admin status"] + "</span class='carre-vert'></td></tr>";
        } else {
            htmlContentCOR += "<tr><td><strong>Admin state : </strong><span class='carre-rouge'>" + snmpInfo["admin status"] + "</span class='carre-rouge'></td></tr>";
        }
        if (snmpInfo["oper status"] == "up") {
            htmlContentCOR += "<tr><td><strong>Oper state  :</strong><span class='carre-vert'>" + snmpInfo["oper status"] + "</span class='carre-vert'></td></tr>";
        } else {
            htmlContentCOR += "<tr><td><strong>Oper state :</strong><span class='carre-rouge'>" + snmpInfo["oper status"] + "</span class='carre-rouge'></td></tr>";
        }
        htmlContentCOR += "<tr><td><strong>MTU : </strong>" + snmpInfo["mtu"] + "</td></tr>";
        htmlContentCOR += "<tr><td><strong>Transceiver Type : </strong>" + snmpInfo["type_sfp"] + "</td></tr>";
        htmlContentCOR += "<tr><td><strong>TX laser wavelength : </strong>" + snmpInfo["longueur_onde"] + "</td></tr>";
        htmlContentCOR += "<tr><td><strong>Connector Code : </strong>" + snmpInfo["type_connecteur"] + "</td></tr>";
        htmlContentCOR += "</table>";
        htmlContentCOR += "<p> </p>";

        
        htmlContentCOR +=  `<hr style="border: 1px solid #ccc; margin: 20px 0;"></hr>`;

        htmlContentCOR += "<table border='0' class='table-centree'>";
        htmlContentCOR += "<tr><td></td><td><strong>Value</strong></td><td><strong>High Alarm</strong></td><td><strong>High Warn</strong></td><td><strong>Low warn</strong></td><td><strong>Low alarm</strong></td></tr>";
        if (snmpInfo["Validation_Puissance_Optique_TX"] == "1") {
            htmlContentCOR += "<tr><td><strong>Tx Output Power (dBm)</strong></td><td><span class='carre-vert'>" + snmpInfo["puissance_optique_TX"] + "</span class='carre-vert'></td><td>" + snmpInfo["high_alarm_TX"] + "</td><td>" + snmpInfo["high_warning_TX"] + "</td><td>" + snmpInfo["low_warning_TX"] + "</td><td>" + snmpInfo["low_alarm_TX"] + "</td></tr>";
        } else {
            htmlContentCOR += "<tr><td><strong>Tx Output Power (dBm)</strong></td><td><span class='carre-rouge'>" + snmpInfo["puissance_optique_TX"] + "</span class='carre-rouge'></td><td>" + snmpInfo["high_alarm_TX"] + "</td><td>" + snmpInfo["high_warning_TX"] + "</td><td>" + snmpInfo["low_warning_TX"] + "</td><td>" + snmpInfo["low_alarm_TX"] + "</td></tr>";
        }
        if (snmpInfo["Validation_Puissance_Optique_RX"] == "1") {
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