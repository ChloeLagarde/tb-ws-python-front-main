import MappingEMUX from './mappingEMUX.js';

// Fonction pour normaliser les noms de ports pour la comparaison
function normalizePortName(portName) {
    if (!portName) return '';
    
    // Convertir en string et nettoyer
    let normalized = portName.toString().trim();
    
    // Enlever les préfixes courants (0/0/0/, .0/0/0/, FH, etc.)
    normalized = normalized.replace(/^\.?0\/0\/0\//, ''); // Enlève 0/0/0/ ou .0/0/0/
    normalized = normalized.replace(/^FH/, ''); // Enlève FH
    normalized = normalized.replace(/^TenGigE/, ''); // Enlève TenGigE
    normalized = normalized.replace(/^HundredGigE/, ''); // Enlève HundredGigE
    normalized = normalized.replace(/^FortyGigE/, ''); // Enlève FortyGigE
    
    // Garder seulement la partie numérique (ex: "8" ou "8/2")
    return normalized;
}

// Fonction pour créer un ID d'ancre basé sur le nom de port normalisé
function createPortAnchorId(portName) {
    const normalized = normalizePortName(portName);
    return `port-detail-${normalized.replace(/[^a-zA-Z0-9]/g, '-')}`;
}

// Fonction pour créer un dépliant natif
function createNativePortAccordion(ports, formatStatus, formatOpticalPower) {
    let content = '<div class="native-accordion">';
    
    ports.forEach((port, index) => {
        const portId = `port-${index}-${Date.now()}`;
        const headerId = `header-${index}-${Date.now()}`;
        
        // Créer un ID d'ancre unique pour ce port basé sur la version normalisée
        const portAnchorId = createPortAnchorId(port.port);
        
        // Header du port avec ancre
        content += `
            <div class="accordion-header" id="${portAnchorId}" data-port-name="${port.port ?? 'N/A'}" onclick="toggleAccordionItem('${portId}', '${headerId}')">
                <div class="accordion-content-wrapper">
                    <span class="accordion-title">Port ${port.port ?? 'N/A'}</span>
                </div>
                <span class="accordion-icon">▶</span>
            </div>
        `;
        
        // Contenu du port
        content += `<div class="accordion-content" id="${portId}" style="display: none;">`;
        content += `<div class="port-box">`;
        content += `<p><strong>Bande passante :</strong> ${port.bandwidth ?? 'N/A'}</p>`;
        content += `<p><strong>Admin :</strong> ${formatStatus(port.admin_status, 'admin')}</p>`;
        content += `<p><strong>MAC :</strong> ${port.physical_address ?? 'N/A'}</p>`;
        content += `<p><strong>Description :</strong> ${port.description ?? 'N/A'}</p>`;
        
        // Informations de bundle si disponibles
        if (port.bundle && port.bundle !== 'N/A') {
            // Créer un ID d'ancre pour le bundle basé sur son nom
            const bundleAnchorId = `lag-details-${port.bundle?.replace(/[^a-zA-Z0-9]/g, '-')}`;
            
            content += `<h5>Informations Bundle 
                <button onclick="scrollToBundle('${bundleAnchorId}')" class="btn-bundle-nav" title="Voir le bundle complet">Voir Bundle</button>
            </h5>`;
            content += `<p><strong>Bundle :</strong> ${port.bundle}</p>`;
            content += `<p><strong>Status Bundle :</strong> ${formatStatus(port.status_bundle, 'admin')}</p>`;
            content += `<p><strong>État :</strong> ${formatStatus(port.state, 'admin')}</p>`;
        }
        
        content += `<p><strong>Signal RX :</strong> ${formatOpticalPower(port.signal_optique_rx)}</p>`;
        
        if (port.threshold) {
            content += `<p class="threshold-info"><em>Seuil RX: ${port.threshold.rx_low} à ${port.threshold.rx_high} dBm</em></p>`;
        }
        
        content += `<p><strong>Signal TX :</strong> ${formatOpticalPower(port.signal_optique_tx)}</p>`;
        
        if (port.threshold) {
            content += `<p class="threshold-info"><em>Seuil TX: ${port.threshold.tx_low} à ${port.threshold.tx_high} dBm</em></p>`;
        }
        
        content += `<p><strong>FEC :</strong> ${port.fec_state ?? 'N/A'}</p>`;
        content += `<p><strong>Longueur d'onde :</strong> ${port.wavelength ?? 'N/A'}</p>`;
        content += `<p><strong>Alarme :</strong> ${formatStatus(port.alarm_status, 'alarm')}</p>`;
        content += `<p><strong>État LED :</strong> ${port.led_state ?? 'N/A'}</p>`;
        content += `<p><strong>État Laser :</strong> ${port.laser_state ?? 'N/A'}</p>`;

        if (port.type_sfp) {
            content += `<h5>Informations SFP/QSFP</h5>`;
            content += `<p><strong>PID :</strong> ${port.type_sfp?.PID ?? 'N/A'}</p>`;
            content += `<p><strong>Type Optique :</strong> ${port.type_sfp?.['Optics type'] ?? 'N/A'}</p>`;
            content += `<p><strong>Nom :</strong> ${port.type_sfp?.Name ?? 'N/A'}</p>`;
            content += `<p><strong>Part Number :</strong> ${port.type_sfp?.['Part Number'] ?? 'N/A'}</p>`;
        }
        
        content += `</div></div>`;
    });
    
    content += '</div>';
    return content;
}

// Fonction pour créer le tableau des LAGs/Bundles
function createLAGsTable(lags) {
    if (!lags || lags.length === 0) {
        return '';
    }

    let content = `<h2>LAGs/Bundles (${lags.length})</h2>`;
    content += `<table class="table_olt">`;
    content += `<thead>
        <tr>
            <th>Bundle</th>
            <th>Status</th>
            <th>Ports</th>
            <th>Actions</th>
        </tr>
    </thead>
    <tbody>`;

    lags.forEach((lag, lagIndex) => {
        const lagId = `lag-${lagIndex}-${Date.now()}`;
        
        // Formatage du statut
        let statusClass = 'status-warning';
        if (lag.status && lag.status.toLowerCase() === 'up') {
            statusClass = 'status-up';
        } else if (lag.status && lag.status.toLowerCase().includes('admin down')) {
            statusClass = 'status-admin-down';
        } else if (lag.status && lag.status.toLowerCase() === 'down') {
            statusClass = 'status-down';
        }

        // Comptage des ports
        const portCount = lag.ports ? lag.ports.length : 0;
        const activePortCount = lag.ports ? lag.ports.filter(p => p.state && p.state.toLowerCase() === 'active').length : 0;

        content += `<tr>
            <td><strong>${lag.bundle_name ?? 'N/A'}</strong></td>
            <td><span class="${statusClass}">${lag.status ?? 'N/A'}</span></td>
            <td>${activePortCount}/${portCount} ports</td>
            <td><button onclick="toggleLagDetails('${lagId}')" class="btn-lag-details">Détails</button></td>
        </tr>`;

        // Créer un ID d'ancre unique pour ce bundle
        const bundleAnchorId = `lag-details-${lag.bundle_name?.replace(/[^a-zA-Z0-9]/g, '-') ?? 'na'}`;

        // Ligne de détails (cachée par défaut)
        content += `<tr id="${lagId}" data-anchor="${bundleAnchorId}" style="display: none;">
            <td colspan="4">
                <div class="lag-details" id="${bundleAnchorId}">`;

        if (lag.ports && lag.ports.length > 0) {
            content += `<h4>Ports du bundle ${lag.bundle_name}</h4>
                <table class="lag-ports-table">
                    <thead>
                        <tr>
                            <th>Port</th>
                            <th>État</th>
                        </tr>
                    </thead>
                    <tbody>`;

            lag.ports.forEach(port => {
                let portStateClass = 'status-warning';
                if (port.state && port.state.toLowerCase() === 'active') {
                    portStateClass = 'status-up';
                } else if (port.state && port.state.toLowerCase() === 'inactive') {
                    portStateClass = 'status-down';
                }

                // Créer un ID unique pour le port basé sur la version normalisée
                const portAnchorId = createPortAnchorId(port.port);

                content += `<tr>
                    <td>${port.port ?? 'N/A'}</td>
                    <td>
                        <span class="${portStateClass}">${port.state ?? 'N/A'}</span>
                        <button onclick="scrollToPort('${portAnchorId}')" class="btn-port-nav" title="Voir les détails du port">Plus</button>
                    </td>
                </tr>`;
            });

            content += `</tbody></table>`;
        } else {
            content += `<p>Aucun port configuré pour ce bundle</p>`;
        }

        content += `</div></td></tr>`;
    });

    content += `</tbody></table>`;

    return content;
}

// Fonction globale pour basculer l'affichage
window.toggleAccordionItem = function(contentId, headerId) {
    const content = document.getElementById(contentId);
    const header = document.querySelector(`[onclick*="${contentId}"]`);
    const icon = header?.querySelector('.accordion-icon');
    
    if (content && header && icon) {
        if (content.style.display === 'none') {
            content.style.display = 'block';
            icon.textContent = '▼';
            header.classList.add('active');
        } else {
            content.style.display = 'none';
            icon.textContent = '▶';
            header.classList.remove('active');
        }
    }
};

// Fonction globale pour basculer les détails des LAGs
window.toggleLagDetails = function(lagId) {
    const lagRow = document.getElementById(lagId);
    const button = document.querySelector(`[onclick="toggleLagDetails('${lagId}')"]`);
    
    if (lagRow && button) {
        if (lagRow.style.display === 'none') {
            lagRow.style.display = 'table-row';
            button.textContent = 'Masquer';
        } else {
            lagRow.style.display = 'none';
            button.textContent = 'Détails';
        }
    }
};

// Fonction globale pour scroller vers un port spécifique
window.scrollToPort = function(portAnchorId) {
    console.log('Recherche du port avec ancre:', portAnchorId);
    
    // D'abord essayer de trouver directement par ID
    let portElement = document.getElementById(portAnchorId);
    
    // Si pas trouvé, chercher tous les éléments avec des data-port-name et comparer les versions normalisées
    if (!portElement) {
        console.log('Port non trouvé par ID, recherche alternative...');
        
        const allPortHeaders = document.querySelectorAll('.accordion-header[data-port-name]');
        
        // Extraire le nom de port normalisé de l'ancre recherchée
        const searchedNormalized = portAnchorId.replace('port-detail-', '').replace(/-/g, '/');
        console.log('Nom de port normalisé recherché:', searchedNormalized);
        
        for (const header of allPortHeaders) {
            const portName = header.getAttribute('data-port-name');
            const normalizedPortName = normalizePortName(portName);
            
            console.log(`Comparaison: "${normalizedPortName}" avec "${searchedNormalized}"`);
            
            if (normalizedPortName === searchedNormalized || 
                normalizedPortName === searchedNormalized.replace(/\//g, '-')) {
                portElement = header;
                console.log('Port trouvé !', portName);
                break;
            }
        }
    }
    
    if (portElement) {
        // Ouvrir l'accordion si fermé
        const accordionContent = portElement.nextElementSibling;
        const icon = portElement.querySelector('.accordion-icon');
        
        if (accordionContent && accordionContent.style.display === 'none') {
            accordionContent.style.display = 'block';
            if (icon) icon.textContent = '▼';
            portElement.classList.add('active');
        }
        
        // Scroll vers l'élément avec un délai pour l'animation
        setTimeout(() => {
            portElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Ajouter un effet de highlight temporaire
            const originalBg = portElement.style.backgroundColor;
            portElement.style.backgroundColor = '#fff3cd';
            setTimeout(() => {
                portElement.style.backgroundColor = originalBg;
            }, 2000);
        }, 300);
    } else {
        console.error('Port non trouvé avec ancre:', portAnchorId);
        alert(`Port non trouvé. ID recherché: ${portAnchorId}`);
    }
};

// Fonction globale pour scroller vers un bundle spécifique
window.scrollToBundle = function(bundleAnchorId) {
    const bundleRow = document.getElementById(bundleAnchorId);
    if (bundleRow) {
        // Trouver la ligne parente (tr) qui contient les détails
        const parentTr = bundleRow.closest('tr');
        
        // Ouvrir les détails du bundle si fermés
        if (parentTr && parentTr.style.display === 'none') {
            parentTr.style.display = 'table-row';
            
            // Trouver le lagId depuis l'attribut id du tr
            const lagId = parentTr.id;
            const button = document.querySelector(`[onclick="toggleLagDetails('${lagId}')"]`);
            if (button) {
                button.textContent = 'Masquer';
            }
        }
        
        // Scroll vers l'élément
        setTimeout(() => {
            bundleRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Ajouter un effet de highlight temporaire
            const originalBg = bundleRow.style.backgroundColor;
            bundleRow.style.backgroundColor = '#d1ecf1';
            setTimeout(() => {
                bundleRow.style.backgroundColor = originalBg;
            }, 2000);
        }, 300);
    } else {
        console.error('Bundle non trouvé avec ancre:', bundleAnchorId);
    }
};

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
    console.log('Données reçues pour PBB :', data);

    if (!data || typeof data !== 'object') {
        return "<p>Erreur : Données invalides</p>";
    }

    // Fonction pour formater les statuts avec couleurs
    function formatStatus(status, type = 'general') {
    if (!status || status === 'N/A') {
        return `<span class="status-warning">N/A</span>`;
    }
    
    const statusLower = status.toString().toLowerCase();
    
    switch (type) {
        case 'admin':
        case 'port':
            if (statusLower === 'up') {
                return `<span class="status-up">${status}</span>`;
            } else if (statusLower.includes('admin down')) {
                return `<span class="status-admin-down">${status}</span>`;
            } else if (statusLower === 'down') {
                return `<span class="status-down">${status}</span>`;
            } else {
                return `<span class="status-warning">${status}</span>`;
            }
            
        case 'alarm':
            if (statusLower === 'none' || statusLower === 'aucune') {
                return `<span class="alarm-none">${status}</span>`;
            } else {
                return `<span class="alarm-active">${status}</span>`;
            }
            
        default:
            return `<span>${status}</span>`;
    }
}

    // Fonction pour formater les puissances optiques
    function formatOpticalPower(powerValue) {
        if (!powerValue || powerValue === 'N/A') {
            return `<span class="status-warning">N/A</span>`;
        }

        // Extraire la valeur numérique
        const numericPower = parseFloat(powerValue.toString().replace(/[^\d.-]/g, ''));
        
        if (isNaN(numericPower)) {
            return `<span class="status-warning">${powerValue}</span>`;
        }

        // Logique simplifiée pour les puissances :
        // < -25 dBm : danger (rouge)
        // -25 à -15 dBm : warning (orange)  
        // > -15 dBm : good (vert)
        if (numericPower < -25) {
            return `<span class="power-danger">${powerValue}</span>`;
        } else if (numericPower < -15) {
            return `<span class="power-warning">${powerValue}</span>`;
        } else {
            return
            return `<span class="power-good">${powerValue}</span>`;
        }
    }

    let content = `<h2>Informations générales</h2>
    <table class="table_olt">
        <tr><td class="table_olt_th">Hostname</td><td>${data.equipment_info?.hostname ?? 'N/A'}</td></tr>
        <tr><td class="table_olt_th">IP</td><td>${data.equipment_info?.ip_address ?? 'N/A'}</td></tr>
        <tr><td class="table_olt_th">DNS</td><td>${data.equipment_info?.dns_complet ?? 'N/A'}</td></tr>
        <tr><td class="table_olt_th">Type</td><td>${data.equipment_info?.type ?? 'N/A'}</td></tr>
        <tr><td class="table_olt_th">Version</td><td id="version-cell-pbb">${data.equipment_info?.Version ?? 'N/A'}</td></tr>
    </table>`;

    // Vérification asynchrone de la version après affichage initial
    if (data.equipment_info?.type && data.equipment_info?.Version) {
        setTimeout(() => {
            formatVersionStatus(data.equipment_info.type, data.equipment_info.Version).then(formattedVersion => {
                const versionCell = document.getElementById('version-cell-pbb');
                if (versionCell) {
                    versionCell.innerHTML = formattedVersion;
                }
            });
        }, 100);
    }

    // Affichage des LAGs/Bundles
    if (data.lags && data.lags.length > 0) {
        content += createLAGsTable(data.lags);
    }

    if (data.ports?.length > 0) {
        content += `<h2>Ports (${data.ports.length})</h2>`;
        content += createNativePortAccordion(data.ports, formatStatus, formatOpticalPower);
    } else {
        content += `<p class="no-data">Aucun port trouvé</p>`;
    }

    console.log('fin afficherPBB()');
    return content;
}

export function afficherService(data) {
    console.log('afficherService appelée');
    console.log('Données reçues pour Service :', data);

    if (!data || typeof data !== 'object') {
        return "<p>Erreur : Données invalides</p>";
    }

    // Fonction pour formater les statuts avec couleurs
    function formatStatus(status, type = 'general') {
        if (!status || status === 'N/A') {
            return `<span class="status-warning">N/A</span>`;
        }
        
        const statusLower = status.toString().toLowerCase();
        
        switch (type) {
            case 'admin':
            case 'port':
                if (statusLower === 'up') {
                    return `<span class="status-up">${status}</span>`;
                } else if (statusLower === 'down') {
                    return `<span class="status-down">${status}</span>`;
                } else {
                    return `<span class="status-warning">${status}</span>`;
                }
                
            case 'alarm':
                if (statusLower === 'none' || statusLower === 'aucune') {
                    return `<span class="alarm-none">${status}</span>`;
                } else {
                    return `<span class="alarm-active">${status}</span>`;
                }
                
            default:
                return `<span>${status}</span>`;
        }
    }

    // Fonction pour déterminer la classe de couleur des puissances optiques
    function getPowerColorClass(powerValue, thresholds) {
        if (!powerValue || !thresholds || powerValue === 'N/A') {
            return 'status-warning';
        }

        // Extraire la valeur numérique de la puissance (enlever "dBm")
        const numericPower = parseFloat(powerValue.toString().replace(/[^\d.-]/g, ''));
        
        if (isNaN(numericPower)) {
            return 'status-warning';
        }

        const rxHigh = parseFloat(thresholds.rx_high || 0);
        const rxLow = parseFloat(thresholds.rx_low || 0);
        const txHigh = parseFloat(thresholds.tx_high || 0);
        const txLow = parseFloat(thresholds.tx_low || 0);

        // Déterminer les seuils selon que c'est RX ou TX
        let highThreshold, lowThreshold;
        if (powerValue.toString().includes('rx') || arguments[2] === 'rx') {
            highThreshold = rxHigh;
            lowThreshold = rxLow;
        } else {
            highThreshold = txHigh;
            lowThreshold = txLow;
        }

        // Logique des couleurs :
        // Rouge : dépasse les limites
        if (numericPower > highThreshold || numericPower < lowThreshold) {
            return 'power-danger';
        }
        
        // Orange : à 2dB des limites
        if ((numericPower > (highThreshold - 2)) || (numericPower < (lowThreshold + 2))) {
            return 'power-warning';
        }
        
        // Vert : dans la plage normale
        return 'power-good';
    }

    // Fonction pour formater une puissance avec couleur
    function formatPowerWithColor(powerValue, thresholds, type = '') {
        const colorClass = getPowerColorClass(powerValue, thresholds);
        const displayValue = powerValue ?? 'N/A';
        return `<span class="${colorClass}">${displayValue}</span>`;
    }

    // Fonction pour formater les puissances optiques (version simple)
    function formatOpticalPower(powerValue) {
        if (!powerValue || powerValue === 'N/A') {
            return `<span class="status-warning">N/A</span>`;
        }

        const numericPower = parseFloat(powerValue.toString().replace(/[^\d.-]/g, ''));
        
        if (isNaN(numericPower)) {
            return `<span class="status-warning">${powerValue}</span>`;
        }

        if (numericPower < -25) {
            return `<span class="power-danger">${powerValue}</span>`;
        } else if (numericPower < -15) {
            return `<span class="power-warning">${powerValue}</span>`;
        } else {
            return `<span class="power-good">${powerValue}</span>`;
        }
    }

    // Vérifier si les données sont dans le format "service" (avec equipments) ou "equipment" (avec equipment_info)
    if (data.equipments && Array.isArray(data.equipments)) {
        // Format service avec plusieurs équipements
        let content = `<h2>Informations du service</h2>`;
        
        content += `<p><strong>Service ID :</strong> ${data.service_id ?? 'N/A'}</p>`;
        content += `<p><strong>Statut :</strong> ${formatStatus(data.success ? 'Succès' : 'Échec')}</p>`;
        content += `<p><strong>Nombre d'équipements :</strong> ${data.equipment_count ?? 'N/A'}</p>`;

        // Affichage des équipements
        if (data.equipments.length > 0) {
            content += `<h2>Équipements (${data.equipments.length})</h2>`;
            
            data.equipments.forEach((equipment, index) => {
                const script = equipment.resultat_script;
                
                content += `<h3>Équipement ${index + 1}: ${equipment.hostname}</h3>`;
                content += `<p><strong>Hostname :</strong> ${equipment.hostname}</p>`;
                content += `<p><strong>Port :</strong> ${equipment.port ?? 'N/A'}</p>`;
                
                if (script && !script.error) {
                    content += `<p><strong>IP :</strong> ${script.ip_address ?? 'N/A'}</p>`;
                    content += `<p><strong>DNS :</strong> ${script.dns_complet ?? 'N/A'}</p>`;
                    content += `<p><strong>Type :</strong> ${script.type ?? 'N/A'}</p>`;
                    content += `<p><strong>Version :</strong> <span id="version-cell-service-${index}">${script.Version ?? 'N/A'}</span></p>`;

                    // Vérification asynchrone de la version
                    if (script.type && script.Version) {
                        setTimeout(() => {
                            formatVersionStatus(script.type, script.Version).then(formattedVersion => {
                                const versionCell = document.getElementById(`version-cell-service-${index}`);
                                if (versionCell) {
                                    versionCell.innerHTML = formattedVersion;
                                }
                            });
                        }, 100 + (index * 10));
                    }

                    // Affichage des LAGs/Bundles pour cet équipement
                    if (script.lags && script.lags.length > 0) {
                        content += createLAGsTable(script.lags);
                    }

                    // Affichage des ports si disponibles avec dépliant natif
                    if (script.ports && script.ports.length > 0) {
                        content += `<h4>Ports détaillés</h4>`;
                        content += createNativePortAccordion(script.ports, formatStatus, formatOpticalPower);
                    } else {
                        content += `<p class="no-data">Aucun port détaillé trouvé pour cet équipement.</p>`;
                    }
                } else if (script && script.error) {
                    content += `<p><strong>Statut :</strong> ${formatStatus('Erreur', 'general')}</p>`;
                    content += `<p><strong>Type :</strong> ${script.type ?? 'N/A'}</p>`;
                    content += `<div style="background-color: #ffe6e6; padding: 10px; border-radius: 5px; margin: 10px 0;">
                        <strong>Erreur:</strong> ${script.error}
                    </div>`;
                } else {
                    content += `<p><strong>Statut :</strong> Données non disponibles</p>`;
                }
                
                // Séparateur entre équipements
                if (index < data.equipments.length - 1) {
                    content += `<hr style="margin: 20px 0; border: 1px solid #ddd;">`;
                }
            });
        } else {
            content += `<p class="no-data">Aucun équipement trouvé</p>`;
        }

        return content;
    } else {
        // Format equipment simple avec equipment_info
        const equipInfo = data.equipment_info || {};
        
        let content = `<h2>Informations du service/équipement</h2>`;
        content += `<p><strong>Hostname :</strong> ${equipInfo.hostname ?? 'N/A'}</p>`;
        content += `<p><strong>IP :</strong> ${equipInfo.ip_address ?? 'N/A'}</p>`;
        content += `<p><strong>DNS :</strong> ${equipInfo.dns_complet ?? 'N/A'}</p>`;
        content += `<p><strong>Type :</strong> ${equipInfo.type ?? 'N/A'}</p>`;
        content += `<p><strong>Version :</strong> <span id="version-cell-simple">${equipInfo.Version ?? 'N/A'}</span></p>`;

        // Vérification asynchrone de la version
        if (equipInfo.type && equipInfo.Version) {
            setTimeout(() => {
                formatVersionStatus(equipInfo.type, equipInfo.Version).then(formattedVersion => {
                    const versionCell = document.getElementById('version-cell-simple');
                    if (versionCell) {
                        versionCell.innerHTML = formattedVersion;
                    }
                });
            }, 100);
        }

        // Vérifier si les données semblent être des erreurs de résolution DNS
        if (equipInfo.ip_address === "DNS non résolu" || equipInfo.dns_complet === "DNS non résolu") {
            content += `<div class="dns-error">
                <strong>Attention :</strong> Les informations DNS ne peuvent pas être résolues. 
                Cela peut indiquer un problème de connectivité ou que l'équipement n'est pas accessible.
            </div>`;
        }

        // Affichage des LAGs/Bundles
        if (data.lags && data.lags.length > 0) {
            content += createLAGsTable(data.lags);
        }

        if (data.ports && data.ports.length > 0) {
            content += `<h2>Ports (${data.ports.length})</h2>`;
            content += createNativePortAccordion(data.ports, formatStatus, formatOpticalPower);
        } else {
            content += `<div class="no-data">
                <p><strong>Aucun port trouvé</strong></p>
                <p>Cela peut être normal pour certains types de services ou indiquer que les données ne sont pas encore disponibles.</p>
            </div>`;
        }

        return content;
    }
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
    var conent = event.target.parentElement.nextElementSibling;
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
    var dnsContainer = document.gerElementByID('dns-container');
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