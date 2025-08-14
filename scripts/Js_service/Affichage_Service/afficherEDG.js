export function EDG(snmpInfo, equipmentName, ip, port) {
    if (!snmpInfo) {
        return "<p>Pas d'informations SNMP disponibles</p>";
    }

    const isValid = (val) => {
        return val !== undefined &&
               val !== null &&
               val !== "" &&
               val.toString().toLowerCase() !== "none" &&
               val.toString().toLowerCase() !== "unknown";
    };

    let htmlContent = `<ul><h2>${equipmentName}`;
    if (isValid(snmpInfo["description"])) {
        htmlContent += ` # ${snmpInfo["description"]}`;
    } else if (isValid(ip)) {
        htmlContent += ` # ${ip}`;
    }
    htmlContent += `</h2><table border='0'>`;

    if (isValid(port)) {
        htmlContent += `<tr><td><strong>Interface : </strong>${port}</td></tr>`;
    }
    if (isValid(snmpInfo["speed"])) {
        htmlContent += `<tr><td><strong>Oper Speed : </strong>${snmpInfo["speed"]}</td></tr>`;
        htmlContent += `<tr><td><strong>Config Speed :</strong>${snmpInfo["speed"]}</td></tr>`;
    }

    if (isValid(snmpInfo["admin status"])) {
        htmlContent += `<tr><td><strong>Admin state : </strong>
            <span class='${snmpInfo["admin status"] === "up" ? "carre-vert" : "carre-rouge"}'>
                ${snmpInfo["admin status"]}
            </span></td></tr>`;
    }

    if (isValid(snmpInfo["oper status"])) {
        htmlContent += `<tr><td><strong>Oper state : </strong>
            <span class='${snmpInfo["oper status"] === "up" ? "carre-vert" : "carre-rouge"}'>
                ${snmpInfo["oper status"]}
            </span></td></tr>`;
    }

    if (isValid(snmpInfo["mtu"])) {
        htmlContent += `<tr><td><strong>MTU : </strong>${snmpInfo["mtu"]}</td></tr>`;
    }

    if (isValid(snmpInfo["type_sfp"])) {
        htmlContent += `<tr><td><strong>Transceiver Type : </strong>${snmpInfo["type_sfp"]}</td></tr>`;
    }

    if (isValid(snmpInfo["type_connecteur"])) {
        htmlContent += `<tr><td><strong>Connector Code : </strong>${snmpInfo["type_connecteur"]}</td></tr>`;
    }

    htmlContent += `</table><p></p>`;

    if(snmpInfo["speed"] === "100 Gbps" && typeof snmpInfo["Puissance_Optique100G"] === "object"){
      const puissance = snmpInfo["Puissance_Optique100G"];

      const highAlarmTx   = (puissance[`HighAlarmTX_1`]   !== undefined ? puissance[`HighAlarmTX_1`].toFixed(2)   : "-");
      const highWarningTx = (puissance[`HighWarningTX_1`] !== undefined ? puissance[`HighWarningTX_1`].toFixed(2) : "-");
      const lowWarningTx  = (puissance[`LowWarningTX_1`]  !== undefined ? puissance[`LowWarningTX_1`].toFixed(2)  : "-");
      const lowAlarmTx    = (puissance[`LowAlarmTX_1`]    !== undefined ? puissance[`LowAlarmTX_1`].toFixed(2)    : "-");

      const highAlarmRx   = (puissance[`HighAlarmRX_1`]   !== undefined ? puissance[`HighAlarmRX_1`].toFixed(2)   : "-");
      const highWarningRx = (puissance[`HighWarningRX_1`] !== undefined ? puissance[`HighWarningRX_1`].toFixed(2) : "-");
      const lowWarningRx  = (puissance[`LowWarningRX_1`]  !== undefined ? puissance[`LowWarningRX_1`].toFixed(2)  : "-");
      const lowAlarmRx    = (puissance[`LowAlarmRX_1`]    !== undefined ? puissance[`LowAlarmRX_1`].toFixed(2)    : "-");
      let laneCount = 0;
        for (const key in puissance) {
            const match = key.match(/^Puissance_Optique_TX_(\d+)$/);
            if (match) {
                const laneNum = parseInt(match[1]);
                if (laneNum > laneCount) laneCount = laneNum;
            }
        }
      
      htmlContent += `<h2>Valeurs Optiques (100G - ${laneCount} lane )</h2>`;

      htmlContent += `
        <table border="1" style="margin-bottom: 20px;">
          <thead>
            <tr>
              <th>High Alarm TX</th>
              <th>High Warning TX</th>
              <th>Low Warning TX</th>
              <th>Low Alarm TX</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${highAlarmTx} (dBm)</td>
              <td>${highWarningTx} (dBm)</td>
              <td>${lowWarningTx} (dBm)</td>
              <td>${lowAlarmTx} (dBm)</td>
            </tr>
          </tbody>
        </table>`;

      
      htmlContent += `
        <table border="1" style="margin-bottom: 20px;">
          <thead>
            <tr>
              <th>High Alarm RX</th>
              <th>High Warning RX</th>
              <th>Low Warning RX</th>
              <th>Low Alarm RX</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${highAlarmRx} (dBm)</td>
              <td>${highWarningRx} (dBm)</td>
              <td>${lowWarningRx} (dBm)</td>
              <td>${lowAlarmRx} (dBm)</td>
            </tr>
          </tbody>
        </table>`;

        htmlContent +=`
        <table border="1" style="margin-bottom: 20px;">
          <thead>
            <tr>
              <th>Lane ID</th>
              <th>Tx Pwr (dBm)</th>
              <th>Rx Pwr (dBm)</th>
            </tr>
          </thead>
          <tbody>`;

        for (let canal = 1;canal <= laneCount; canal++){
          const txVal = puissance[`Puissance_Optique_TX_${canal}`]
          const rxVal = puissance[`Puissance_Optique_RX_${canal}`]
          const txStr = (txVal !== undefined) ? txVal.toFixed(2) : "-";
          const rxStr = (rxVal !== undefined) ? rxVal.toFixed(2) : "-";

          htmlContent += `
          <tr>
            <td>${canal}</td>
            <td>${txStr}</td>
            <td>${rxStr}</td>
          </tr>`
        }

        htmlContent += `
          </tbody>
        </table>`;

    } else {
        // Cas standard (pas 100G) inchangé
        const showTx = isValid(snmpInfo["puissance_optique_TX"]);
        const showRx = isValid(snmpInfo["puissance_optique_RX"]);

        if (showTx || showRx) {
            htmlContent += `<table border='0' class='table-centree'>
                <tr><td></td><td><strong>Value</strong></td><td><strong>High Alarm</strong></td>
                <td><strong>High Warn</strong></td><td><strong>Low Warn</strong></td><td><strong>Low Alarm</strong></td></tr>`;

            if (showTx) {
                htmlContent += `<tr>
                    <td><strong>Tx Output Power(dBm)</strong></td>
                    <td><span class='${snmpInfo["Validation_Puissance_Optique_TX"] == "1" ? "carre-vert" : "carre-rouge"}'>
                        ${snmpInfo["puissance_optique_TX"]}
                    </span></td>
                    <td>${isValid(snmpInfo["high_alarm_TX"]) ? snmpInfo["high_alarm_TX"] : ""}</td>
                    <td>${isValid(snmpInfo["high_warning_TX"]) ? snmpInfo["high_warning_TX"] : ""}</td>
                    <td>${isValid(snmpInfo["low_warning_TX"]) ? snmpInfo["low_warning_TX"] : ""}</td>
                    <td>${isValid(snmpInfo["low_alarm_TX"]) ? snmpInfo["low_alarm_TX"] : ""}</td>
                </tr>`;
            }

            if (showRx) {
                htmlContent += `<tr>
                    <td><strong>Rx Optical Power (dBm)</strong></td>
                    <td><span class='${snmpInfo["Validation_Puissance_Optique_RX"] == "1" ? "carre-vert" : "carre-rouge"}'>
                        ${snmpInfo["puissance_optique_RX"]}
                    </span></td>
                    <td>${isValid(snmpInfo["high_alarm_RX"]) ? snmpInfo["high_alarm_RX"] : ""}</td>
                    <td>${isValid(snmpInfo["high_warning_RX"]) ? snmpInfo["high_warning_RX"] : ""}</td>
                    <td>${isValid(snmpInfo["low_warning_RX"]) ? snmpInfo["low_warning_RX"] : ""}</td>
                    <td>${isValid(snmpInfo["low_alarm_RX"]) ? snmpInfo["low_alarm_RX"] : ""}</td>
                </tr>`;
            }

            htmlContent += `</table>`;
        }
    }

    htmlContent += `</ul>`;
    return htmlContent;
}
