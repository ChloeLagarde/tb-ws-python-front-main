import MappingEMUX from './mappingEMUX.js';

// ========================================================================
// FONCTIONS UTILITAIRES POUR JQUERY UI ACCORDION
// ========================================================================

// Fonction utilitaire pour créer un indicateur de statut
function createStatusIndicator(status) {
    const statusClass = status === 'up' || status === 'OK' ? 'status-up' : 
                      status === 'down' || status === 'KO' ? 'status-down' : 'status-warning';
    return `<span class="status-indicator ${statusClass}"></span>`;
}

// Fonction utilitaire pour créer un badge de statut
function createStatusBadge(status, text = null) {
    const displayText = text || status;
    const badgeClass = status === 'up' || status === 'OK' ? 'badge-up' : 
                     status === 'down' || status === 'KO' ? 'badge-down' : 'badge-warning';
    return `<span class="status-badge ${badgeClass}">${displayText.toUpperCase()}</span>`;
}

// Fonction pour initialiser les accordéons jQuery UI
function initializeAccordions() {
    // Accordéon principal pour les équipements
    $(".equipment-accordion").accordion({
        collapsible: true,
        active: false,
        animate: 300,
        heightStyle: "content",
        icons: {
            header: "ui-icon-circle-arrow-e",
            activeHeader: "ui-icon-circle-arrow-s"
        }
    });

    // Accordéon pour les ports
    $(".ports-accordion").accordion({
        collapsible: true,
        active: false,
        animate: 200,
        heightStyle: "content",
        icons: {
            header: "ui-icon-triangle-1-e",
            activeHeader: "ui-icon-triangle-1-s"
        }
    });

    // Accordéon pour les LAG et entités mères
    $(".lag-accordion, .entity-accordion").accordion({
        collapsible: true,
        active: false,
        animate: 250,
        heightStyle: "content",
        icons: {
            header: "ui-icon-plus",
            activeHeader: "ui-icon-minus"
        }
    });
}

// Fonction pour formater les puissances optiques avec couleur dans les accordéons
function formatOpticalPowerAccordion(power) {
    if (!power || power === 'N/A') {
        return `<span class="status-badge badge-warning">N/A</span>`;
    }
    
    const numericPower = parseFloat(power.toString().replace(/[^\d.-]/g, ''));
    if (isNaN(numericPower)) {
        return `<span class="status-badge badge-warning">${power}</span>`;
    }
    
    let badgeClass = '';
    if (numericPower > -15) badgeClass = 'badge-up';
    else if (numericPower > -25) badgeClass = 'badge-warning';
    else badgeClass = 'badge-down';
    
    return `<span class="status-badge ${badgeClass}">${power}</span>`;
}

// ========================================================================
// FONCTIONS D'AFFICHAGE AVEC ACCORDÉONS
// ========================================================================

// Fonction utilitaire pour générer les détails d'un port
function generatePortDetailsHTML(port) {
    return `
        <div class="port-card">
            <div class="port-header">
                <span class="port-name">Port ${port.port}</span>
                <span class="status-badge badge-info">${port.bandwidth || 'N/A'}</span>
            </div>
            <div class="port-details">
                <div class="detail-item">
                    <span class="detail-label">Statut:</span>
                    <span class="detail-value">${createStatusIndicator(port.status)}${port.status || 'N/A'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Admin:</span>
                    <span class="detail-value">${createStatusIndicator(port.admin_status)}${port.admin_status || 'N/A'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">MAC:</span>
                    <span class="detail-value">${port.physical_address || 'N/A'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Description:</span>
                    <span class="detail-value">${port.description || 'N/A'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Signal RX:</span>
                    <span class="detail-value">${formatOpticalPowerAccordion(port.signal_optique_rx)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Signal TX:</span>
                    <span class="detail-value">${formatOpticalPowerAccordion(port.signal_optique_tx)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">FEC:</span>
                    <span class="detail-value">${port.fec_state || 'N/A'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Longueur d'onde:</span>
                    <span class="detail-value">${port.wavelength || 'N/A'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Alarmes:</span>
                    <span class="detail-value">${createStatusBadge(port.alarm_status === 'none' ? 'up' : 'down', port.alarm_status || 'N/A')}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">État LED:</span>
                    <span class="detail-value">${port.led_state || 'N/A'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">État Laser:</span>
                    <span class="detail-value">${port.laser_state || 'N/A'}</span>
                </div>
            </div>
            ${port.type_sfp ? `
                <div class="sfp-info">
                    <strong><i class="fas fa-microchip"></i> Informations SFP/QSFP:</strong>
                    <div class="port-details" style="margin-top: 8px;">
                        <div class="detail-item">
                            <span class="detail-label">PID:</span>
                            <span class="detail-value">${port.type_sfp.PID || 'N/A'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Type Optique:</span>
                            <span class="detail-value">${port.type_sfp['Optics type'] || 'N/A'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Nom:</span>
                            <span class="detail-value">${port.type_sfp.Name || 'N/A'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Part Number:</span>
                            <span class="detail-value">${port.type_sfp['Part Number'] || 'N/A'}</span>
                        </div>
                    </div>
                </div>
            ` : ''}
            ${port.threshold ? `
                <div class="sfp-info">
                    <strong><i class="fas fa-chart-line"></i> Seuils optiques:</strong>
                    <div class="port-details" style="margin-top: 8px;">
                        <div class="detail-item">
                            <span class="detail-label">Seuil RX:</span>
                            <span class="detail-value">${port.threshold.rx_low} à ${port.threshold.rx_high} dBm</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Seuil TX:</span>
                            <span class="detail-value">${port.threshold.tx_low} à ${port.threshold.tx_high} dBm</span>
                        </div>
                    </div>
                </div>
            ` : ''}
        </div>
    `;
}

// Fonction améliorée pour afficher PBB avec accordéons
function afficherPBBWithAccordion(data) {
    console.log('afficherPBBWithAccordion appelée');
    
    if (!data || typeof data !== 'object') {
        return "<p>Erreur : Données invalides</p>";
    }

    const equipInfo = data.equipment_info || {};
    const ports = data.ports || [];
    
    // Compter les statuts des ports
    const portsUp = ports.filter(p => p.status === 'up').length;
    const portsDown = ports.filter(p => p.status === 'down').length;
    const portsTotal = ports.length;

    let content = `
        <div class="equipment-accordion">
            <h3>
                <i class="fas fa-server"></i>
                Informations générales - ${equipInfo.hostname || 'N/A'}
                ${createStatusBadge('up', 'ACTIF')}
            </h3>
            <div>
                <table class="accordion-table">
                    <tr>
                        <th>Hostname</th>
                        <td>${equipInfo.hostname || 'N/A'}</td>
                    </tr>
                    <tr>
                        <th>Adresse IP</th>
                        <td>${equipInfo.ip_address || 'N/A'}</td>
                    </tr>
                    <tr>
                        <th>DNS Complet</th>
                        <td>${equipInfo.dns_complet || 'N/A'}</td>
                    </tr>
                    <tr>
                        <th>Type d'équipement</th>
                        <td>${equipInfo.type || 'N/A'}</td>
                    </tr>
                    <tr>
                        <th>Version logicielle</th>
                        <td id="version-cell-pbb-accordion">${equipInfo.Version || 'N/A'}</td>
                    </tr>
                </table>
            </div>
    `;

    if (portsTotal > 0) {
        content += `
            <h3>
                <i class="fas fa-network-wired"></i>
                Ports (${portsTotal})
                <span class="accordion-header-stats">
                    ${createStatusBadge('up', portsUp + ' UP')}
                    ${createStatusBadge('down', portsDown + ' DOWN')}
                </span>
            </h3>
            <div>
                <div class="ports-accordion">
        `;

        ports.forEach((port, index) => {
            const statusIcon = port.status === 'up' ? 'fa-check-circle' : 'fa-times-circle';
            const statusColor = port.status === 'up' ? '#28a745' : '#dc3545';
            
            content += `
                <h4>
                    <i class="fas ${statusIcon}" style="color: ${statusColor}"></i>
                    Port ${port.port} - ${port.description || 'Sans description'}
                    ${createStatusBadge(port.status)}
                </h4>
                <div>
                    ${generatePortDetailsHTML(port)}
                </div>
            `;
        });

        content += `
                </div>
            </div>
        `;
    } else {
        content += `
            <h3>
                <i class="fas fa-network-wired"></i>
                Ports
                ${createStatusBadge('warning', 'AUCUN')}
            </h3>
            <div>
                <div class="accordion-status-message warning">
                    <i class="fas fa-exclamation-triangle"></i>
                    Aucun port trouvé pour cet équipement.
                </div>
            </div>
        `;
    }

    content += `</div>`;

    return content;
}

// Fonction améliorée pour afficher les services avec accordéons
function afficherServiceWithAccordion(data) {
    console.log('afficherServiceWithAccordion appelée');
    
    if (!data || typeof data !== 'object') {
        return "<p>Erreur : Données invalides</p>";
    }

    let content = '';

    // Traitement pour services avec plusieurs équipements
    if (data.equipments && Array.isArray(data.equipments)) {
        const totalEquipments = data.equipments.length;
        const successfulEquipments = data.equipments.filter(eq => eq.resultat_script && !eq.resultat_script.error).length;
        
        content += `
            <div class="equipment-accordion">
                <h3>
                    <i class="fas fa-cogs"></i>
                    Service ${data.service_id || 'N/A'}
                    <span class="accordion-header-stats">
                        ${createStatusBadge('up', successfulEquipments + '/' + totalEquipments + ' OK')}
                    </span>
                </h3>
                <div>
                    <table class="accordion-table">
                        <tr>
                            <th>Service ID</th>
                            <td>${data.service_id || 'N/A'}</td>
                        </tr>
                        <tr>
                            <th>Statut global</th>
                            <td>${createStatusBadge(data.success ? 'up' : 'down', data.success ? 'Succès' : 'Échec')}</td>
                        </tr>
                        <tr>
                            <th>Nombre d'équipements</th>
                            <td>${totalEquipments}</td>
                        </tr>
                        <tr>
                            <th>Équipements opérationnels</th>
                            <td>${successfulEquipments}</td>
                        </tr>
                    </table>
                </div>
        `;

        // Affichage des équipements individuels
        if (data.equipments.length > 0) {
            content += `
                <h3>
                    <i class="fas fa-server"></i>
                    Équipements (${totalEquipments})
                </h3>
                <div>
                    <div class="entity-accordion">
            `;

            data.equipments.forEach((equipment, index) => {
                const script = equipment.resultat_script;
                const hasError = script && script.error;
                const statusIcon = hasError ? 'fa-times-circle' : 'fa-check-circle';
                const statusColor = hasError ? '#dc3545' : '#28a745';
                
                content += `
                    <h4>
                        <i class="fas ${statusIcon}" style="color: ${statusColor}"></i>
                        ${equipment.hostname} - Port ${equipment.port || 'N/A'}
                        ${createStatusBadge(hasError ? 'down' : 'up', hasError ? 'ERREUR' : 'OK')}
                    </h4>
                    <div>
                `;

                if (script && !hasError) {
                    // Affichage des informations de l'équipement
                    content += `
                        <table class="accordion-table">
                            <tr>
                                <th>Hostname</th>
                                <td>${equipment.hostname}</td>
                            </tr>
                            <tr>
                                <th>Port</th>
                                <td>${equipment.port || 'N/A'}</td>
                            </tr>
                            <tr>
                                <th>IP</th>
                                <td>${script.ip_address || 'N/A'}</td>
                            </tr>
                            <tr>
                                <th>DNS</th>
                                <td>${script.dns_complet || 'N/A'}</td>
                            </tr>
                            <tr>
                                <th>Type</th>
                                <td>${script.type || 'N/A'}</td>
                            </tr>
                            <tr>
                                <th>Version</th>
                                <td id="version-cell-service-accordion-${index}">${script.Version || 'N/A'}</td>
                            </tr>
                        </table>
                    `;

                    // Affichage des ports si disponibles
                    if (script.ports && script.ports.length > 0) {
                        content += `
                            <div class="ports-accordion" style="margin-top: 15px;">
                        `;

                        script.ports.forEach(port => {
                            content += `
                                <h5>
                                    <i class="fas fa-ethernet"></i>
                                    Port ${port.port} - ${port.description || 'Sans description'}
                                    ${createStatusBadge(port.status)}
                                </h5>
                                <div>
                                    ${generatePortDetailsHTML(port)}
                                </div>
                            `;
                        });

                        content += `</div>`;
                    }
                } else if (hasError) {
                    content += `
                        <div class="accordion-status-message error">
                            <i class="fas fa-exclamation-circle"></i>
                            <strong>Erreur:</strong> ${script.error}
                        </div>
                        <table class="accordion-table">
                            <tr>
                                <th>Hostname</th>
                                <td>${equipment.hostname}</td>
                            </tr>
                            <tr>
                                <th>Port</th>
                                <td>${equipment.port || 'N/A'}</td>
                            </tr>
                            <tr>
                                <th>Type détecté</th>
                                <td>${script.type || 'N/A'}</td>
                            </tr>
                        </table>
                    `;
                } else {
                    content += `
                        <div class="accordion-status-message warning">
                            <i class="fas fa-question-circle"></i>
                            Données non disponibles pour cet équipement.
                        </div>
                    `;
                }

                content += `</div>`;
            });

            content += `
                    </div>
                </div>
            `;
        }

        content += `</div>`;
    } else {
        // Traitement pour équipement simple
        content = afficherPBBWithAccordion(data);
    }

    return content;
}

// ========================================================================
// FONCTIONS ORIGINALES MISES À JOUR
// ========================================================================

export function afficherOLT(data) {
    console.log('afficherOLT()');

    const rectangleDonnee = document.getElementById('rectangleDonnee');
    
    if (!rectangleDonnee) {
        console.error("L'élément rectangleDonnee est introuvable dans le DOM.");
        return;
    }

    rectangleDonnee.innerHTML = '';

    let content = '<table class="table_olt">';

    const statusTemplate = (label, status, details = '') => `
        <tr><td class="table_olt_th">${label}</td>
        <td style="text-align:center;font-weight:700;color:white;padding:12px;border-radius:50px;background-color:${status === 'OK' ? '#5cb85c' : 'red'};">${status}</td></tr>
        <tr><td colspan="2"><pre>${details}</pre></td></tr>
    `;

    // Modification de matchStatus pour éviter l'erreur
    const matchStatus = (test, pattern) => test && test.match(pattern) ? 'OK' : 'KO';

    // PING
    content += statusTemplate('PING', matchStatus(data['ping'], /time\=/), data['ping']);

    // SPECTRUM
    content += statusTemplate('SPECTRUM', matchStatus(data['spectrum'], /en prod/), data['spectrum']);

    // SPECTRUM IHUB (si type = 7360)
    if (data['type'] === '7360') {
        content += statusTemplate('SPECTRUM IHUB', matchStatus(data['spectrum ihub'], /en prod/), data['spectrum ihub']);
    }

    // Vérification de l'existence de 'ssh' et 'show equipment slot'
    if (data['ssh'] && data['ssh']['show equipment slot']) {
        const carteStatus = (data['ssh']['show equipment slot'].match(/lt\:1\/1\/1\s+fwlt-c\s+yes\s+no-error\s+available/) &&
                             data['ssh']['show equipment slot'].match(/lt\:1\/1\/4\s+felt-b\s+yes\s+no-error\s+available/)) ? 'OK' : 'KO';
        content += statusTemplate('CARTES', carteStatus, data['ssh']['show equipment slot']
            .replace(/\r\n[\=]+\r\n/g, '')
            .replace(/\#show equipment slot|slot table/g, '')
            .replace(/olt\-\w+\-\d+/g, ''));
    } else {
        content += statusTemplate('CARTES', 'KO', 'Données non disponibles.');
    }

    // REDONDANCE
    if (data['ssh'] && data['ssh']['show equipment protection-element']) {
        const redondanceStatus = (data['ssh']['show equipment protection-element'].match(/nt-a\s+providing-service\s+1\s+normal\s+none/) &&
                                  data['ssh']['show equipment protection-element'].match(/nt-b\s+hot-standby\s+1\s+normal\s+none/)) ? 'OK' : 'KO';
        content += statusTemplate('REDONDANCE', redondanceStatus, data['ssh']['show equipment protection-element']
            .replace(/\r\n[\=]+\r\n/g, '')
            .replace(/\#show equipment protection-element|protection-element table/g, '')
            .replace(/olt\-\w+\-\d+/g, ''));
    } else {
        content += statusTemplate('REDONDANCE', 'KO', 'Données non disponibles.');
    }

    // ONT
    if (data['ssh'] && data['ssh']['show equipment ont sw-version']) {
        const ontStatus = (data['ssh']['show equipment ont sw-version'].match(/3FE49327AAA/) &&
                           data['ssh']['show equipment ont sw-version'].match(/3FE46541AAF/) &&
                           data['ssh']['show equipment ont sw-version'].match(/3TN00715BAA/)) ? 'OK' : 'KO';
        content += statusTemplate('ONT', ontStatus, data['ssh']['show equipment ont sw-version']
            .replace(/\r\n[\=]+\r\n/g, '')
            .replace(/\#show equipment ont sw-version|sw-version table/g, '')
            .replace(/olt\-\w+\-\d+/g, ''));
    } else {
        content += statusTemplate('ONT', 'KO', 'Données non disponibles.');
    }

    // ROUTE STATIQUE
    if (data['ssh'] && data['ssh']['show router static-route']) {
        const routeStatus = (data['ssh']['show router static-route'].match(/No\. of Static Routes\: 1/) &&
                             data['ssh']['show router static-route'].match(/olt\-\w+[179]{2}\-\d+/)) ? 'OK' : 'KO';
        content += statusTemplate('ROUTE STATIQUE', routeStatus, data['ssh']['show router static-route']
            .replace(/\r\n[\=]+\r\n/g, '')
            .replace(/\#show router static-route\s|Static Route Table \(Router\: Base\)  Family\: IPv4/g, '')
            .replace(/olt\-\w+\-\d+/g, ''));
    } else {
        content += statusTemplate('ROUTE STATIQUE', 'KO', 'Données non disponibles.');
    }

    // MANAGEMENT
    if (data['ssh'] && data['ssh']['show service id 1090 base']) {
        const managementStatus = data['ssh']['show service id 1090 base'].match(/CLI Invalid service id/) ? 'KO' : 'OK';
        content += statusTemplate('MANAGEMENT', managementStatus, data['ssh']['show service id 1090 base']
            .replace(/\r\n[\=]+\r\n/g, '')
            .replace(/\#show service id 1090 base\s/, '')
            .replace(/olt\-\w+\-\d+/g, ''));
    } else {
        content += statusTemplate('MANAGEMENT', 'KO', 'Données non disponibles.');
    }

    // INTERFACES UPLINK (A & B)
    const uplinkStatus = (uplink, transceiver, port) => (transceiver.match(/Board is not planned|tx-power : not-available|rx-power : not-available|tx-power : \"No Power\"|rx-power : \"No Power\"/) &&
                                                           port.match(/Admin State\s+: Up/) && 
                                                           port.match(/Oper State\s+: Up/)) ? 'OK' : 'KO';

    if (data['ssh'] && data['ssh']['show equipment transceiver-inventory nt-a:xfp:1 detail'] && data['ssh']['show port nt-a:xfp:1']) {
        content += statusTemplate('INTERFACE UPLINK A', uplinkStatus('nt-a', data['ssh']['show equipment transceiver-inventory nt-a:xfp:1 detail'], data['ssh']['show port nt-a:xfp:1']), 
            data['ssh']['show equipment transceiver-inventory nt-a:xfp:1 detail']
            .replace(/\r\n[\=]+\r\n/g, '') +
            '<br>' + data['ssh']['show equipment diagnostics sfp nt-a:xfp:1 detail']
            .replace(/\r\n[\=]+\r\n/g, '') +
            '<br>' + data['ssh']['show port nt-a:xfp:1']
            .replace(/\r\n[\=]+\r\n/g, '')
        );
    } else {
        content += statusTemplate('INTERFACE UPLINK A', 'KO', 'Données non disponibles.');
    }

    if (data['ssh'] && data['ssh']['show equipment transceiver-inventory nt-b:xfp:1 detail'] && data['ssh']['show port nt-b:xfp:1']) {
        content += statusTemplate('INTERFACE UPLINK B', uplinkStatus('nt-b', data['ssh']['show equipment transceiver-inventory nt-b:xfp:1 detail'], data['ssh']['show port nt-b:xfp:1']),
            data['ssh']['show equipment transceiver-inventory nt-b:xfp:1 detail']
            .replace(/\r\n[\=]+\r\n/g, '') +
            '<br>' + data['ssh']['show equipment diagnostics sfp nt-b:xfp:1 detail']
            .replace(/\r\n[\=]+\r\n/g, '') +
            '<br>' + data['ssh']['show port nt-b:xfp:1']
            .replace(/\r\n[\=]+\r\n/g, '')
        );
    } else {
        content += statusTemplate('INTERFACE UPLINK B', 'KO', 'Données non disponibles.');
    }

    rectangleDonnee.innerHTML = content + '</table>';
    rectangleDonnee.style.display = 'block';

    console.log('fin afficherOLT()');
}

// Base de données locale des versions (fallback si CORS échoue)
const localVersionDatabase = {
    "Cisco 8201-32FH": "7.5.3",
    "Cisco C9300": "17.12.04",
    "Cisco C9400": "17.12.04", 
    "Nokia 7750": "22.10.R2",
    "Nokia 7360": "6.4.802",
    "Juniper ERX": "8.2.4p0-16",
    "Juniper E120": "8.2.4p0-16",
    // Ajoutez d'autres équipements ici au fur et à mesure
};

// Fonction pour vérifier et formater le statut de version
async function formatVersionStatus(equipmentType, currentVersion) {
    if (!equipmentType || !currentVersion || equipmentType === 'N/A' || currentVersion === 'N/A') {
        return `<span class="version-unknown">${currentVersion || 'N/A'}</span>`;
    }

    // D'abord essayer la base locale
    if (localVersionDatabase[equipmentType]) {
        const localLatestVersion = localVersionDatabase[equipmentType];
        const isUpToDate = compareVersions(currentVersion, localLatestVersion);
        
        if (isUpToDate) {
            return `<span class="version-up-to-date">${currentVersion}</span>`;
        } else {
            return `<span class="version-outdated">${currentVersion} (dernière: ${localLatestVersion})</span>`;
        }
    }

    // Ensuite essayer le wiki avec la même méthode que Service.py
    try {
        const wikiUrl = 'https://wiki.int.axione.fr/index.php/SOFT';
        
        // Headers similaires à Service.py
        const headers = {
            'Referer': 'https://wiki.int.axione.fr',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
        };

        const response = await fetch(wikiUrl, {
            method: 'GET',
            headers: headers,
            mode: 'cors',
            credentials: 'include',
            cache: 'no-cache'
        });

        if (!response.ok) {
            return `<span class="version-unknown">${currentVersion}</span>`;
        }

        const htmlText = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlText, 'text/html');
        const tables = doc.querySelectorAll('table');
        
        for (let tableIndex = 0; tableIndex < tables.length; tableIndex++) {
            const table = tables[tableIndex];
            const rows = table.querySelectorAll('tr');
            
            for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
                const row = rows[rowIndex];
                const cells = row.querySelectorAll('td, th');
                
                if (cells.length >= 3) {
                    const typeCell = cells[0]?.textContent?.trim();
                    
                    if (typeCell && typeCell.length > 0) {
                        // Vérifier si le type d'équipement correspond (recherche partielle et exacte)
                        if (typeCell.includes(equipmentType) || 
                            typeCell.toLowerCase().includes(equipmentType.toLowerCase()) ||
                            equipmentType.includes(typeCell)) {
                            
                            // Chercher la colonne "Dernière Version logicielle validée"
                            let versionCell = cells[2]?.textContent?.trim();
                            
                            // Si pas de version en colonne 3, essayer colonne 4 ou 5
                            if (!versionCell || versionCell === '' || versionCell === 'N/A') {
                                versionCell = cells[3]?.textContent?.trim() || cells[4]?.textContent?.trim();
                            }
                            
                            if (versionCell && versionCell !== '' && versionCell !== 'N/A') {
                                // Comparer les versions
                                const isUpToDate = compareVersions(currentVersion, versionCell);
                                
                                if (isUpToDate) {
                                    return `<span class="version-up-to-date">${currentVersion}</span>`;
                                } else {
                                    return `<span class="version-outdated">${currentVersion} (dernière: ${versionCell})</span>`;
                                }
                            }
                        }
                    }
                }
            }
        }
        
        return `<span class="version-unknown">${currentVersion}</span>`;
        
    } catch (error) {
        return `<span class="version-unknown">${currentVersion}</span>`;
    }
}

// Fonction utilitaire pour comparer les versions
function compareVersions(current, latest) {
    if (!current || !latest) return false;
    
    // Nettoyer les versions (enlever les espaces et caractères indésirables)
    const cleanCurrent = current.toString().trim();
    const cleanLatest = latest.toString().trim();
    
    // Comparaison exacte d'abord
    if (cleanCurrent === cleanLatest) return true;
    
    // Extraire les numéros de version (ex: "7.5.3" -> [7, 5, 3])
    const currentParts = cleanCurrent.split('.').map(part => {
        const num = parseInt(part.replace(/[^\d]/g, ''));
        return isNaN(num) ? 0 : num;
    });
    
    const latestParts = cleanLatest.split('.').map(part => {
        const num = parseInt(part.replace(/[^\d]/g, ''));
        return isNaN(num) ? 0 : num;
    });
    
    // Comparer chaque partie de version
    const maxLength = Math.max(currentParts.length, latestParts.length);
    
    for (let i = 0; i < maxLength; i++) {
        const currentPart = currentParts[i] || 0;
        const latestPart = latestParts[i] || 0;
        
        if (currentPart < latestPart) return false; // Version obsolète
        if (currentPart > latestPart) return true;  // Version plus récente
    }
    
    return true; // Versions identiques
}

export function afficherPBB(data) {
    console.log('afficherPBB appelée');
    
    const rectangleDonnee = document.getElementById('rectangleDonnee');
    
    if (!rectangleDonnee) {
        console.error("L'élément rectangleDonnee est introuvable dans le DOM.");
        return;
    }

    // Utiliser la nouvelle fonction avec accordéons
    const content = afficherPBBWithAccordion(data);
    rectangleDonnee.innerHTML = content;
    
    // Vérification asynchrone de la version après affichage initial
    if (data.equipment_info?.type && data.equipment_info?.Version) {
        setTimeout(() => {
            formatVersionStatus(data.equipment_info.type, data.equipment_info.Version).then(formattedVersion => {
                const versionCell = document.getElementById('version-cell-pbb-accordion');
                if (versionCell) {
                    versionCell.innerHTML = formattedVersion;
                }
            });
        }, 100);
    }
    
    // Initialiser les accordéons
    setTimeout(() => {
        initializeAccordions();
    }, 150);
    
    rectangleDonnee.style.display = 'block';
    console.log('fin afficherPBB()');
}

export function afficherService(data) {
    console.log('afficherService appelée');
    
    const rectangleDonnee = document.getElementById('rectangleDonnee');
    
    if (!rectangleDonnee) {
        console.error("L'élément rectangleDonnee est introuvable dans le DOM.");
        return;
    }

    // Utiliser la nouvelle fonction avec accordéons
    const content = afficherServiceWithAccordion(data);
    rectangleDonnee.innerHTML = content;
    
    // Vérifications asynchrones des versions après affichage initial
    if (data.equipments && Array.isArray(data.equipments)) {
        data.equipments.forEach((equipment, index) => {
            const script = equipment.resultat_script;
            if (script && script.type && script.Version) {
                setTimeout(() => {
                    formatVersionStatus(script.type, script.Version).then(formattedVersion => {
                        const versionCell = document.getElementById(`version-cell-service-accordion-${index}`);
                        if (versionCell) {
                            versionCell.innerHTML = formattedVersion;
                        }
                    });
                }, 100 + (index * 10)); // Délai échelonné pour éviter les conflits
            }
        });
    } else if (data.equipment_info?.type && data.equipment_info?.Version) {
        setTimeout(() => {
            formatVersionStatus(data.equipment_info.type, data.equipment_info.Version).then(formattedVersion => {
                const versionCell = document.getElementById('version-cell-simple');
                if (versionCell) {
                    versionCell.innerHTML = formattedVersion;
                }
            });
        }, 100);
    }
    
    // Initialiser les accordéons
    setTimeout(() => {
        initializeAccordions();
    }, 150);
    
    rectangleDonnee.style.display = 'block';
    console.log('fin afficherService()');
}

export function afficherServiceWDM(dataToDisplay) {
    const equipementData = dataToDisplay.find(item => item["Nom equipement"]);
    const cartesData = dataToDisplay.filter(item => item["Type de carte"]);

    // Génère le tableau d'informations de l'équipement
    const equipementTable = `
        <h2>Informations sur l'équipement</h2>
        <table border="1" style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
                <tr>
                    <th>Nom Équipement</th>
                    <th>Adresse IP</th>
                    <th>DNS</th>
                    <th>Version</th>
                    <th>Statut</th>
                    
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>${equipementData["Nom equipement"]}</td>
                    <td>${equipementData["Adresse IP"]}</td>
                    <td>${equipementData["DNS"]}</td>
                    <td>${equipementData["Version"]}</td>
                    <td>Actif</td>
                </tr>
            </tbody>
        </table>`;

    // Génère le tableau d'informations des cartes avec la flèche pour "32EC2"
    const cartesTable = `
        <h2>Informations sur les cartes</h2>
        <table border="1" style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
                <tr>
                    <th>Type de Carte</th>
                    <th>Châssis</th>
                    <th>Slot</th>
                </tr>
            </thead>
            <tbody>
                ${cartesData.map((carte, index) => `
                    <tr class="carte-row" onclick="toggleDetails(${index})" style="cursor: pointer;">
                        <td>
                            ${carte["Type de carte"] === "32EC2" ? `<span class="chevron" id="chevron-${index}">▶</span>` : ""}
                            ${carte["Type de carte"]}
                        </td>
                        <td>${carte["Shelf"] || carte["Chassis"] || "Non spécifié"}</td>
                        <td>${carte["Slot"]}</td>
                    </tr>
                    ${carte["Type de carte"] === "32EC2" ? `
                        <tr id="details-${index}" class="details-row" style="display:none;">
                            <td colspan="3">
                                <div>
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Température</th>
                                                <th>Mesure de courant</th>
                                                <th>Puissance mesurée</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>${carte["Temperature"] || "N/A"}</td>
                                                <td>${carte["Measured Current"] || "N/A"}</td>
                                                <td>${carte["Measured Power"] || "N/A"}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </td>
                        </tr>
                    ` : ''}`
                ).join('')}
            </tbody>
        </table>`;

    return `${equipementTable}${cartesTable}`;
}

window.toggleDetails = function(index) {
    const detailsRow = document.getElementById(`details-${index}`);
    const chevron = document.getElementById(`chevron-${index}`);
    
    if (detailsRow && chevron) {
        if (detailsRow.style.display === "none") {
            detailsRow.style.display = "table-row";
            
            setTimeout(() => {
                chevron.classList.add("down");
            }, 100);
        } else {
            detailsRow.style.display = "none";
            chevron.classList.remove("down");
        }
    }
}

export function afficherInfoDNS(dns){
    console.log("Information DNS pour :", dns);
}

export function searchEquipement(idService, typeCarte, slot)
{
    console.log('Recherche d\'équipement pour :', idService, typeCarte, slot);
}

export function toggleContent(event){
    var content = event.target.parentElement.nextElementSibling;
    if (content.classList.contains('hidden-content')){
        content.classList.remove('hidden-content');
        content.classList.add('visible-content');
        event.target.classList.remove('fa-chevron-down');
        event.target.classList.add('fa-chevron-up');
    } 
    else 
    {
        content.classList.remove('visible-content');
        content.classList.add('hidden-content');
        event.target.classList.remove('fa-chevron-up');
        event.target.classList.add('fa-chevron-down');
    }
}

export function showLoadingIcon()
{
    $('.btn-verification').html('<div id="loading-icon"><i class="fas fa-spinner fa-spin"></i></div>').attr('disabled', true);
}

export function hideLoadingIcon()
{
    $('.btn-verification').html('<b>Vérification</b>').attr('disabled', false);
}

export function resetContainers()
{
    var dnsResultatDiv = document.getElementById('dns-resultat');
    var emuxResultatDiv = document.getElementById('emux-container');
    
    if (dnsResultatDiv)
    {
        dnsResultatDiv.innerHTML = '';
    }

    if (emuxResultatDiv) 
    {
        emuxResultatDiv.innerHTML = '';
    }
}

export function afficherResultatDNS(data){
    const dnsContainer = document.getElementById('dns-container');
    const dnsResultatDiv = document.getElementById('dns-resultat');
    const emuxResultatDiv = document.getElementById('emux-container');

    dnsResultatDiv.innerHTML = '';
    emuxResultatDiv.innerHTML = '';

    const {DNS:dns,"Adresse IP":ip,Version:version} = data[0];
    const dnsElement = creerParagraphe(`DNS :${dns}`,ajouterBoutonInfo());
    const ipElement = creerParagraphe(`IP : ${ip}`);
    const versionElement = creerVersionElement(version);

    dnsResultatDiv.append(dnsElement, creerInfoText(), ipElement, versionElement, document.createElement('br'));

    data.slice(1).forEach(equipement =>{
        dnsResultatDiv.appendChild(creerEquipementInfo(equipement));
    });

    dnsContainer.style.display = 'block';
}

function creerParagraphe(texte,childElement){
    const p = document.createElement('p');
    p.textContent = texte;

    if (childElement) p.appendChild(childElement);
    return p;
}

function ajouterBoutonInfo(){
    const infoButton = document.createElement('button');
    infoButton.classList.add('btn-info');
    infoButton.innerHTML = `<i class="fas fa-info-circle"></i>`;
    infoButton.onmouseenter = () => afficherInfoTexte(infoButton);
    return infoButton;
}

function creerVersionElement(version){
    const versionElement = creerParagraphe(`Version : ${version}`);
    const iconClass = version?.match(/6\.4\.802/) ? 'fa-check-circle' : 'fa-times-circle';
    const iconColor = version?.match(/6\.4\.802/) ? '' : '#ff0000';
    
    versionElement.classList.add(version?.match(/6\.4\.802/) ? 'version-special' : 'version-special-red');
    versionElement.innerHTML += `<i class="fas ${iconClass} icon-special" style="color: ${iconColor};"></i>`;
    
    return versionElement;
}

function creerInfoText() {
    const infoText = document.createElement('div');
    infoText.classList.add('info-text');
    infoText.innerHTML = `
        <p>Toutes les informations ne sont pas affichées.</p>
        <p>Souhaitez-vous tout afficher ? *Attention, ça peut prendre (beaucoup) de temps</p>
        <button class="btn-oui" onclick="chargerPlusInfo()">Oui</button>
        <p>Il est possible d'afficher à l'aide des loupes à côté de chaque nom de carte</p>
    `;
    return infoText;
}

function creerEquipementInfo(equipement) {
    const { "Type de carte": typeCarte, Slot: slot } = equipement;
    const equipementInfo = document.createElement('div');
    equipementInfo.classList.add('equipement-info');

    const typeCarteElement = creerParagraphe(`Type de carte : ${typeCarte}`, creerBoutonRecherche(typeCarte, slot));
    const slotElement = creerParagraphe(`Slot : ${slot}`);

    equipementInfo.append(typeCarteElement, slotElement, document.createElement('hr').classList.add('separator'));
    
    return equipementInfo;
}

function creerBoutonRecherche(typeCarte, slot) {
    const buttonElement = document.createElement('button');
    buttonElement.classList.add('btn-magnifying-glass');
    buttonElement.onclick = () => searchEquipement(typeCarte, slot, chassis);
    buttonElement.innerHTML = `<i class="fas fa-magnifying-glass"></i>`;
    return buttonElement;
}

export function afficherInfoTexte(infoText)
{
    var infoTextElement = document.querySelector('.info-text');
    infoTextElement.style.display = 'block';

    // Événement pour garder le bloc d'information affiché si survolé
    infoTextElement.addEventListener('mouseenter', function()
    {
        infoTextElement.style.display = 'block';
    });

    // Événement pour masquer le bloc d'information lorsque non survolé
    infoTextElement.addEventListener('mouseleave', function() 
    {
        infoTextElement.style.display = 'none';
    });
}

export function afficherDetailsEMUX(data)
{
    var dnsContainer = document.getElementById('dns-container');
    var emuxResultatDiv = document.getElementById('emux-container');
    var dnsResultatDiv = document.getElementById('dns-resultat');
    dnsResultatDiv.innerHTML = '';
    emuxResultatDiv.innerHTML = '';

    var dnsElement = document.createElement('p');
    dnsElement.textContent = 'DNS : '+dns;
    var ipElement = document.createElement('p');
    ipElement.textContent = 'IP : '+ip;

    var versionElement = document.createElement('p');
    versionElement.textContent = 'Version : '+version;
    if(version != undefined && version.match(/6\.4\.802/)){
        versionElement.classList.add('version-special');
        var iconElement = document.createElement('i');
        iconElement.classList.add('fas', 'fa-check-circle','icon-special');
        versionElement.appendChild(iconElement);
    }else{
        versionElement.classList.add('version-special-red');
        var iconElement = document.createElement('i');
        iconElement.classList.add('fas', 'fa-times-circle', 'icon-special-red');
        versionElement.appendChild(iconElement);
    }
    emuxResultatDiv.appendChild(dnsElement);
    emuxResultatDiv.appendChild(ipElement);
    emuxResultatDiv.appendChild(versionElement);

    data.slice(1).forEach(function (equipement)
    {
        var separator = document.createElement('hr');
        separator.classList.add('separator');
        emuxResultatDiv.appendChild(separator);
        var typeCarte = equipement['Type de carte'];  
        var slot = equipement['Slot'];

        var typeCarteElement = document.createElement('p');
        typeCarteElement.textContent = 'Type de carte : ' + typeCarte;
        typeCarteElement.classList.add('type-carte-label'); 
        emuxResultatDiv.appendChild(typeCarteElement);
        typeCarteElement.classList.add('port-hover');
        var slotElement = document.createElement('p');
        slotElement.textContent = 'Slot : ' + slot;

        emuxResultatDiv.appendChild(slotElement);

        switch(true){
            case typeCarte.includes("EMUX"):
                MappingEMUX["EMUX"](equipement, emuxResultatDiv);
                break;
            case typeCarte.includes("FRS02"):
                MappingEMUX["FRS02"](equipement, emuxResultatDiv);
                break;
            case typeCarte.includes("C1008MPLH"):
                MappingEMUX["C1008MPLH"](equipement, emuxResultatDiv);
                break;
            case typeCarte.includes("C1008GE"):
                MappingEMUX["C1008GE"](equipement , emuxResultatDiv);
                break;
            case typeCarte.includes("PM_06006"):
                MappingEMUX["PM_06006"](equipement , emuxResultatDiv);
                break;
            case typeCarte.includes("OAIL-HCS"):
                MappingEMUX["OAIL-HCS"](equipement , emuxResultatDiv);
                break;
            case typeCarte.includes("1001RR"):
                MappingEMUX["1001RR"](equipement, emuxResultatDiv);
                break;
            case typeCarte.includes("C1001HC"):
                MappingEMUX["C1001HC"](equipement, emuxResultatDiv);
                break;
            case typeCarte.includes("PM404"):
                MappingEMUX["PM404"](equipement, emuxResultatDiv);
                break;
            case typeCarte.includes("PMOAB-E") || typeCarte.includes("PMOABP-E")||typeCarte.includes("PMOABPLC-12/23"):
                MappingEMUX["PMOAB"](equipement,emuxResultatDiv);
                break;
            case typeCarte.includes("ROADM"):
                MappingEMUX["ROADM"](equipement,emuxResultatDiv);
                break;
            case typeCarte.includes("OTDR"):
                MappingEMUX["OTDR"](equipement,emuxResultatDiv);
                break;
            case typeCarte.includes("OABP-HCS"):
                MappingEMUX["OABP-HCS"](equipement,emuxResultatDiv);
                break;
            default:
                console.log("Type de carte non pris en charge");
        }
        dnsContainer.style.display = 'block';

    }); 

}