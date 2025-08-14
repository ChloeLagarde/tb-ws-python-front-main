export function OLT(ip, sshInfo, equipmentName) {
    const data = sshInfo.Data;

    if (!data || data.length < 5) {
        return `<h2>${equipmentName} # ${ip}</h2><p>Données indisponibles</p>`;
    }

    const statusAdmin = data[1]?.["admin-status"] || 'unknown';
    const statusOpr = data[1]?.["opr-status"] || 'unknown';
    const txPower = parseFloat(data[0]?.["tx-power"] ?? NaN);
    const rxPower = parseFloat(data[0]?.["rx-power"] ?? NaN);

    const txPwrAlmLow = parseFloat(data[3]?.["tx-pwr-alm-low"] ?? NaN);
    const txPwrAlmHigh = parseFloat(data[3]?.["tx-pwr-alm-high"] ?? NaN);

    const rxPwrAlmLow = parseFloat(data[3]?.["rx-pwr-alm-low"] ?? NaN);
    const rxPwrAlmHigh = parseFloat(data[3]?.["rx-pwr-alm-high"] ?? NaN);

    const isTxPowerNormal = !isNaN(txPower) && txPower >= txPwrAlmLow && txPower <= txPwrAlmHigh;
    const isRxPowerNormal = !isNaN(rxPower) && rxPower >= rxPwrAlmLow && rxPower <= rxPwrAlmHigh;

    let htmlContentOLT = `
        <h2>${equipmentName} # ${ip}</h2>
        <ul>
            <table border="0" style="margin-bottom: 20px;">
                <tr>
                    <td><strong>Status admin :</strong>
                    <span class="${statusAdmin === "up" ? "carre-vert" : "carre-rouge"}">${statusAdmin}</span></td>
                    <td><strong>Wavelength :</strong> ${data[2]?.["tx-wavelength"] || 'N/A'}</td>
                </tr>
                <tr>
                    <td><strong>Oper Status :</strong>
                    <span class="${statusOpr === "up" ? "carre-vert" : "carre-rouge"}">${statusOpr}</span></td>
                    <td>${data[4]?.["sense"] || 'N/A'}</td>
                </tr>
                <tr>
                    <td><strong>Type :</strong> ${data[4]?.["type_ethernet_line"] || 'N/A'}</td>
                    <td><strong>High speed :</strong> ${data[1]?.["high-speed"] || 'N/A'} ${data[4]?.["nego"] || ''}</td>
                </tr>
                <tr>
                    <td><strong>Mfg-name :</strong> ${data[2]?.["mfg-name"] || 'N/A'}</td>
                    <td><strong>Serial-num :</strong> ${data[2]?.["vendor-serial-num"] || 'N/A'}</td>
                </tr>
                <tr>
                    <td><strong>Tx-fault :</strong> ${data[0]?.["tx-fault"] || 'N/A'}</td>
                    <td>${data[0]?.["los"] || 'N/A'}</td>
                </tr>
                <tr>
                    <td><strong>Diag-avail-status :</strong> ${data[0]?.["diag-avail-status"] || 'N/A'}</td>
                    <td><strong>Connector-present :</strong> ${data[1]?.["connector-present"] || 'N/A'}</td>
                </tr>
                <tr>
                    <td><strong>Largest-pkt-size :</strong> ${data[1]?.["largest-pkt-size"] || 'N/A'}</td>
                    <td><strong>Last-chg-opr-stat :</strong> ${data[1]?.["last-chg-opr-stat"] || 'N/A'}</td>
                </tr>
            </table>

            <hr style="border: 1px solid #ccc; margin: 20px 0;">

            <table border="0" style="margin-bottom: 20px;">
                <tr>
                    <td></td>
                    <td><strong>Value</strong></td>
                    <td><strong>High Alarm</strong></td>
                    <td><strong>High Warn</strong></td>
                    <td><strong>Low Warn</strong></td>
                    <td><strong>Low Alarm</strong></td>
                </tr>
                <tr>
                    <td><strong>Tx-power</strong></td>
                    <td><span class="${isTxPowerNormal ? 'carre-vert' : 'carre-rouge'}">${data[0]?.["tx-power"] || 'N/A'}</span></td>
                    <td>${data[3]?.["tx-pwr-alm-high"] || 'N/A'}</td>
                    <td>${data[3]?.["tx-pwr-warn-high"] || 'N/A'}</td>
                    <td>${data[3]?.["tx-pwr-warn-low"] || 'N/A'}</td>
                    <td>${data[3]?.["tx-pwr-alm-low"] || 'N/A'}</td>
                </tr>
                <tr>
                    <td><strong>Rx-power</strong></td>
                    <td><span class="${isRxPowerNormal ? 'carre-vert' : 'carre-rouge'}">${data[0]?.["rx-power"] || 'N/A'}</span></td>
                    <td>${data[3]?.["rx-pwr-alm-high"] || 'N/A'}</td>
                    <td>${data[3]?.["rx-pwr-warn-high"] || 'N/A'}</td>
                    <td>${data[3]?.["rx-pwr-warn-low"] || 'N/A'}</td>
                    <td>${data[3]?.["rx-pwr-alm-low"] || 'N/A'}</td>
                </tr>
            </table>

            <hr style="border: 1px solid #ccc; margin: 20px 0;">

            <table border="0" style="margin-bottom: 20px;">
                <tr><td><strong>in-octets :</strong> ${data[1]?.["in-octets"] || 'N/A'}</td><td><strong>out-octets :</strong> ${data[1]?.["out-octets"] || 'N/A'}</td></tr>
                <tr><td><strong>in-ucast-pkts :</strong> ${data[1]?.["in-ucast-pkts"] || 'N/A'}</td><td><strong>out-ucast-pkts :</strong> ${data[1]?.["out-ucast-pkts"] || 'N/A'}</td></tr>
                <tr><td><strong>in-mcast-pkts :</strong> ${data[1]?.["in-mcast-pkts"] || 'N/A'}</td><td><strong>out-mcast-pkts :</strong> ${data[1]?.["out-mcast-pkts"] || 'N/A'}</td></tr>
                <tr><td><strong>in-broadcast-pkts :</strong> ${data[1]?.["in-broadcast-pkts"] || 'N/A'}</td><td><strong>out-broadcast-pkts :</strong> ${data[1]?.["out-broadcast-pkts"] || 'N/A'}</td></tr>
                <tr><td><strong>in-discard-pkts :</strong> ${data[1]?.["in-discard-pkts"] || 'N/A'}</td><td><strong>out-discard-pkts :</strong> ${data[1]?.["out-discard-pkts"] || 'N/A'}</td></tr>
                <tr><td><strong>in-err-pkts :</strong> ${data[1]?.["in-err-pkts"] || 'N/A'}</td><td><strong>out-err-pkts :</strong> ${data[1]?.["out-err-pkts"] || 'N/A'}</td></tr>
                <tr><td><strong>in-octets-hc :</strong> ${data[1]?.["in-octets-hc"] || 'N/A'}</td><td><strong>out-octets-hc :</strong> ${data[1]?.["out-octets-hc"] || 'N/A'}</td></tr>
            </table>
        </ul>
    `;

    return htmlContentOLT;
}
