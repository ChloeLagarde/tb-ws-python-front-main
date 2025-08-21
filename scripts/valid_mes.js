import afficherDonneesService from './Js_service/service.js';
import afficherDonneesEquipment from './Js_equipment/equipment.js';
import { afficherService } from './Js_equipment/Affichage_Equipment.js';

// ========================================================================
// FONCTIONS UTILITAIRES POUR JQUERY UI
// ========================================================================

// Fonction pour initialiser les accordéons jQuery UI dans valid_mes.js
function initializeAccordionsMain() {
    // Vérifier si jQuery UI est disponible
    if (typeof $.ui === 'undefined') {
        console.warn('jQuery UI non disponible, utilisation de l\'affichage classique');
        return;
    }

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

    console.log('Accordéons jQuery UI initialisés depuis valid_mes.js');
}

// Fonction pour gérer l'affichage avec accordéons
function setupAccordionDisplayMain(data, container) {
    let htmlContent;
    
    // Déterminer le type d'affichage basé sur les données
    if (data.equipments && Array.isArray(data.equipments)) {
        // Service avec plusieurs équipements - utiliser la fonction d'affichage service
        htmlContent = generateServiceAccordionHTML(data);
    } else if (data.equipment_info || data.ports) {
        // Équipement simple - utiliser la fonction d'affichage PBB
        htmlContent = generateEquipmentAccordionHTML(data);
    } else {
        htmlContent = "<p>Format de données non reconnu</p>";
    }
    
    // Injecter le contenu
    if (typeof container === 'string') {
        document.getElementById(container).innerHTML = htmlContent;
    } else {
        container.innerHTML = htmlContent;
    }
    
    // Initialiser les accordéons après un délai pour s'assurer que le DOM est mis à jour
    setTimeout(() => {
        initializeAccordionsMain();
    }, 100);
    
    container.style.display = 'block';
    return htmlContent;
}

// Fonctions pour générer le HTML des accordéons (versions simplifiées)
function generateServiceAccordionHTML(data) {
    if (!data.equipments || !Array.isArray(data.equipments)) {
        return "<p>Aucun équipement trouvé dans le service</p>";
    }

    const totalEquipments = data.equipments.length;
    const successfulEquipments = data.equipments.filter(eq => eq.resultat_script && !eq.resultat_script.error).length;

    return `
        <div class="equipment-accordion">
            <h3>
                <i class="fas fa-cogs"></i>
                Service ${data.service_id || 'N/A'}
                <span class="status-badge badge-up">${successfulEquipments}/${totalEquipments} OK</span>
            </h3>
            <div>
                <table class="accordion-table">
                    <tr><th>Service ID</th><td>${data.service_id || 'N/A'}</td></tr>
                    <tr><th>Statut global</th><td><span class="status-badge ${data.success ? 'badge-up' : 'badge-down'}">${data.success ? 'Succès' : 'Échec'}</span></td></tr>
                    <tr><th>Nombre d'équipements</th><td>${totalEquipments}</td></tr>
                    <tr><th>Équipements opérationnels</th><td>${successfulEquipments}</td></tr>
                </table>
            </div>
            <h3>
                <i class="fas fa-server"></i>
                Équipements (${totalEquipments})
            </h3>
            <div>
                <div class="entity-accordion">
                    ${data.equipments.map((equipment, index) => generateEquipmentItemHTML(equipment, index)).join('')}
                </div>
            </div>
        </div>
    `;
}

function generateEquipmentItemHTML(equipment, index) {
    const script = equipment.resultat_script;
    const hasError = script && script.error;
    const statusIcon = hasError ? 'fa-times-circle' : 'fa-check-circle';
    const statusColor = hasError ? '#dc3545' : '#28a745';
    
    return `
        <h4>
            <i class="fas ${statusIcon}" style="color: ${statusColor}"></i>
            ${equipment.hostname} - Port ${equipment.port || 'N/A'}
            <span class="status-badge ${hasError ? 'badge-down' : 'badge-up'}">${hasError ? 'ERREUR' : 'OK'}</span>
        </h4>
        <div>
            ${hasError ? `
                <div class="accordion-status-message error">
                    <i class="fas fa-exclamation-circle"></i>
                    <strong>Erreur:</strong> ${script.error}
                </div>
            ` : `
                <table class="accordion-table">
                    <tr><th>Hostname</th><td>${equipment.hostname}</td></tr>
                    <tr><th>Port</th><td>${equipment.port || 'N/A'}</td></tr>
                    <tr><th>IP</th><td>${script?.ip_address || 'N/A'}</td></tr>
                    <tr><th>DNS</th><td>${script?.dns_complet || 'N/A'}</td></tr>
                    <tr><th>Type</th><td>${script?.type || 'N/A'}</td></tr>
                    <tr><th>Version</th><td>${script?.Version || 'N/A'}</td></tr>
                </table>
            `}
        </div>
    `;
}

function generateEquipmentAccordionHTML(data) {
    const equipInfo = data.equipment_info || {};
    const ports = data.ports || [];
    
    const portsUp = ports.filter(p => p.status === 'up').length;
    const portsDown = ports.filter(p => p.status === 'down').length;
    const portsTotal = ports.length;

    return `
        <div class="equipment-accordion">
            <h3>
                <i class="fas fa-server"></i>
                Informations générales - ${equipInfo.hostname || 'N/A'}
                <span class="status-badge badge-up">ACTIF</span>
            </h3>
            <div>
                <table class="accordion-table">
                    <tr><th>Hostname</th><td>${equipInfo.hostname || 'N/A'}</td></tr>
                    <tr><th>Adresse IP</th><td>${equipInfo.ip_address || 'N/A'}</td></tr>
                    <tr><th>DNS Complet</th><td>${equipInfo.dns_complet || 'N/A'}</td></tr>
                    <tr><th>Type d'équipement</th><td>${equipInfo.type || 'N/A'}</td></tr>
                    <tr><th>Version logicielle</th><td>${equipInfo.Version || 'N/A'}</td></tr>
                </table>
            </div>
            ${portsTotal > 0 ? `
                <h3>
                    <i class="fas fa-network-wired"></i>
                    Ports (${portsTotal})
                    <span class="status-badge badge-up">${portsUp} UP</span>
                    <span class="status-badge badge-down">${portsDown} DOWN</span>
                </h3>
                <div>
                    <div class="ports-accordion">
                        ${ports.map(port => generatePortItemHTML(port)).join('')}
                    </div>
                </div>
            ` : `
                <h3>
                    <i class="fas fa-network-wired"></i>
                    Ports
                    <span class="status-badge badge-warning">AUCUN</span>
                </h3>
                <div>
                    <div class="accordion-status-message warning">
                        <i class="fas fa-exclamation-triangle"></i>
                        Aucun port trouvé pour cet équipement.
                    </div>
                </div>
            `}
        </div>
    `;
}

function generatePortItemHTML(port) {
    const statusIcon = port.status === 'up' ? 'fa-check-circle' : 'fa-times-circle';
    const statusColor = port.status === 'up' ? '#28a745' : '#dc3545';
    
    return `
        <h4>
            <i class="fas ${statusIcon}" style="color: ${statusColor}"></i>
            Port ${port.port} - ${port.description || 'Sans description'}
            <span class="status-badge ${port.status === 'up' ? 'badge-up' : 'badge-down'}">${port.status?.toUpperCase()}</span>
        </h4>
        <div>
            <div class="port-card">
                <div class="port-header">
                    <span class="port-name">Port ${port.port}</span>
                    <span class="status-badge badge-info">${port.bandwidth || 'N/A'}</span>
                </div>
                <div class="port-details">
                    <div class="detail-item">
                        <span class="detail-label">Statut:</span>
                        <span class="detail-value">${port.status || 'N/A'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Admin:</span>
                        <span class="detail-value">${port.admin_status || 'N/A'}</span>
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
                        <span class="detail-value">${port.signal_optique_rx || 'N/A'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Signal TX:</span>
                        <span class="detail-value">${port.signal_optique_tx || 'N/A'}</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ========================================================================
// FONCTIONS PRINCIPALES (CODE ORIGINAL AVEC MODIFICATIONS)
// ========================================================================

function isDataEffectivelyEmpty(data) {
    if (Array.isArray(data)) {
        if (data.length === 0) return true;
        return data.every(item =>
            typeof item === 'object' &&
            item !== null &&
            Object.values(item).every(
                val => (typeof val === 'object' && val !== null && Object.keys(val).length === 0)
            )
        );
    }

    if (typeof data === 'object' && data !== null) {
        return Object.keys(data).length === 0;
    }

    return !data;
}

// Fonction pour remettre le bouton à l'état normal
function resetButton() {
    $('#Bouton').html('<b>Vérification</b>').attr('disabled', false);
}

// Fonction pour tester si le serveur M2M est joignable
async function pingURL(url) {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1000);
        const response = await fetch(url, { 
            method: 'HEAD', 
            signal: controller.signal,
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        clearTimeout(timeoutId);
        return response.ok ? 1 : 0;
    } catch (error) {
        console.warn('Ping URL failed:', error.message);
        return 0;
    }
}

async function pingReporting(url, timeout = 3000) {
    // D'abord faire un pingStatus HEAD
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    try {
        const headResponse = await fetch(url, {
            method: 'HEAD',
            signal: controller.signal,
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        clearTimeout(timer);

        const statusTexts = {
            200: "OK",
            201: "Créé",
            204: "Pas de contenu",
            301: "Déplacé définitivement",
            302: "Trouvé (redirection temporaire)",
            400: "Requête incorrecte",
            401: "Non autorisé",
            403: "Interdit",
            404: "Non trouvé",
            405: "Méthode non autorisée",
            408: "Temps d'attente de la requête dépassé",
            500: "Erreur interne du serveur",
            502: "Passerelle incorrecte",
            503: "Service indisponible",
            504: "Temps d'attente de la passerelle dépassé"
        };

        const headMessage = statusTexts[headResponse.status] || "Statut HTTP inconnu";

        // Si HEAD est OK, on fait un GET pour vérifier le contenu
        if (headResponse.ok) {
            try {
                const getResponse = await fetch(url, { 
                    method: 'GET',
                    mode: 'cors',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });
                if (!getResponse.ok) {
                    return `HEAD ${headResponse.status} - ${headMessage} | GET erreur HTTP ${getResponse.status}`;
                }
                const data = await getResponse.json();
                if (isDataEffectivelyEmpty(data)) {
                    return `HEAD ${headResponse.status} - ${headMessage} | GET contenu vide ou non exploitable`;
                }
                return `HEAD ${headResponse.status} - ${headMessage} | GET contenu OK`;
            } catch (err) {
                return `HEAD ${headResponse.status} - ${headMessage} | GET erreur : ${err.message}`;
            }
        } else {
            return `HEAD ${headResponse.status} - ${headMessage}`;
        }
    } catch (err) {
        clearTimeout(timer);
        return `Erreur réseau : ${err.name}`;
    }
}

// Fonction pour récupérer des données en GET
async function getData(url) {
    try {
        const response = await fetch(url, {
            method: 'GET',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        if (!response.ok) {
            const message = response.status === 404
                ? "Erreur 404 : Ressource non trouvée."
                : `Erreur ${response.status} : Problème lors de la récupération des données.`;
            throw new Error(message);
        }
        return response.json();
    } catch (error) {
        console.error('getData error:', error);
        throw error;
    }
}

// Fonction principale d'affichage MODIFIÉE pour jQuery UI
async function afficherData(input, ip = "", slot = "") {
    if (!input) {
        alert("Veuillez remplir le champ ID Service");
        resetButton();
        return;
    }

    const rectangleDonnee = document.getElementById("rectangleDonnee");
    if (!rectangleDonnee) {
        console.error("Élément rectangleDonnee non trouvé");
        resetButton();
        return;
    }
    
    rectangleDonnee.innerHTML = "";

    const isService = ["FTTB", "FTTH", "FTTHPRO", "IXEN", "WDM", "CNROA", "VPN", "VPNIP", "VP", "FTTHNCS", "INTE","COVP","OSEN","XGSP","SDSL"].some(type => input.includes(type));
    const hostM2M = `https://tb-ws-python.m2m.axione.fr/`;
    const hostINT = `https://tb-ws-python.int.axione.fr/`;

    try {
        const isHostM2MReachable = await pingURL(hostM2M);
        const baseUrl = isHostM2MReachable ? hostM2M : hostINT;

        if (!isHostM2MReachable) {
            rectangleDonnee.innerHTML += `
                <h2><p style="color: orange;">
                    ⚠️ TB WS Non accessible (Activer le VPN).
                </p></h2>
            `;
            return;
        }

        // Si ce n'est PAS un service connu, appeler directement afficherService avec accordéons
        if (!isService) {
            console.log("Input ne fait pas partie des types de service connus, appel avec accordéons");
            
            let url;
            
            let equipmentName = input;
            let detectedPort = ip;
            
            if (input.includes('_')) {
                const parts = input.split('_');
                equipmentName = parts[0];
                detectedPort = parts.slice(1).join('_');
                
                console.log(`Séparation détectée - Équipement: ${equipmentName}, Port: ${detectedPort}`);
                url = `${baseUrl}equipment/${encodeURIComponent(input)}`;
            } else if (input.includes("PBB")) {
                const params = [];
                if (ip) params.push(`port=${encodeURIComponent(ip)}`);
                if (slot) params.push(`slot=${encodeURIComponent(slot)}`);
                const queryString = params.length ? `?${params.join("&")}` : "";
                url = `${baseUrl}equipment/${input}${queryString}`;
            } else {
                url = `${baseUrl}equipment/${input}`;
            }

            const startTime = performance.now();
            console.log("URL appelée :", url);

            try {
                const data = await getData(url);

                if (isDataEffectivelyEmpty(data)) {
                    rectangleDonnee.innerHTML = `
                        <p style="color:red;">
                            ❌ Aucune donnée exploitable récupérée pour "${input}".
                        </p>
                        <p style="color:red;">
                            URL interrogée pour ${input} : ${url}
                        </p>
                    `;

                    pingReporting(url).then(status1 => {
                        rectangleDonnee.innerHTML += `
                            <p>
                                Ping + contenu <code>${url}</code> : ${status1}
                            </p>
                        `;
                    });

                    return;
                }

                // MODIFICATION : Utiliser l'affichage avec accordéons
                setupAccordionDisplayMain(data, rectangleDonnee);

                const endTime = performance.now();
                console.log(`Temps écoulé pour l'affichage des données : ${(endTime - startTime).toFixed(2)} ms`);

            } catch (error) {
                rectangleDonnee.innerHTML = `<p style="color:red;">❌ Erreur de récupération : ${error.message}</p>`;
                console.error("Erreur lors de la récupération ou du traitement :", error);
            }
            
            return;
        }

        // Logique originale pour les services connus
        let url;

        if (input.includes("PBB")) {
            const params = [];
            if (ip) params.push(`port=${encodeURIComponent(ip)}`);
            if (slot) params.push(`slot=${encodeURIComponent(slot)}`);
            const queryString = params.length ? `?${params.join("&")}` : "";
            url = `${baseUrl}equipment/${input}${queryString}`;
        } else {
            url = `${baseUrl}${isService ? 'service' : 'equipment'}/${input}`;
        }

        const detailsUrl = isService ? null : `${baseUrl}equipment/details/${input}`;

        const startTime = performance.now();
        console.log("URL appelée :", url);

        try {
            const data = await getData(url);

            if (isDataEffectivelyEmpty(data)) {
                rectangleDonnee.innerHTML = `
                    <p style="color:red;">
                        ❌ Aucune donnée exploitable récupérée pour "${input}".
                    </p>
                    <p style="color:red;">
                        URL interrogée pour ${input} : ${url}
                    </p>
                `;

                pingReporting(url).then(status1 => {
                    rectangleDonnee.innerHTML += `
                        <p>
                            Ping + contenu <code>${url}</code> : ${status1}
                        </p>
                    `;
                });

                const ordsUrl = `https://ws-ords.m2m.axione.fr/ordscomxdsl/pwksrefpro/ref_sp?who=${encodeURIComponent(input)}`;
                pingReporting(ordsUrl).then(status2 => {
                    rectangleDonnee.innerHTML += `
                        <p>
                            Ping + contenu <code>${ordsUrl}</code> : ${status2}
                        </p>
                    `;
                });
                
                if (input.includes("FTTH")) {
                    let cleanedInput = input;
                    if (cleanedInput.includes("_Details")) {
                        cleanedInput = cleanedInput.replace("_Details", "");
                    }

                    const hotlineUrl = `https://ws-ords.m2m.axione.fr/ordsdwh/pwksftth/hotline_ftth?who=${encodeURIComponent(cleanedInput)}`;
                    pingReporting(hotlineUrl).then(status2 => {
                        rectangleDonnee.innerHTML += `
                            <p>
                                Ping + contenu <code>${hotlineUrl}</code> : ${status2}
                            </p>
                        `;
                    });
                }

                return;
            }

            if (isService) {
                if (typeof afficherDonneesService === 'function') {
                    // MODIFICATION : Vérifier si on peut utiliser les accordéons pour les services
                    if (typeof $.ui !== 'undefined' && (data.equipments || data.equipment_info)) {
                        setupAccordionDisplayMain(data, rectangleDonnee);
                    } else {
                        afficherDonneesService(data, input);
                    }
                } else {
                    console.error('afficherDonneesService function not available');
                    rectangleDonnee.innerHTML = `<p style="color:red;">❌ Fonction d'affichage service non disponible</p>`;
                }
            } else {
                let equipmentData;
                if (detailsUrl && isHostM2MReachable) {
                    try {
                        equipmentData = await getData(detailsUrl);
                    } catch (error) {
                        if (error.message.includes("404")) {
                            console.warn("Détails non trouvés, traitement des données principales uniquement.");
                        } else {
                            throw error;
                        }
                    }
                }

                if (typeof afficherDonneesEquipment === 'function') {
                    afficherDonneesEquipment(equipmentData || data, input);
                } else {
                    console.error('afficherDonneesEquipment function not available');
                    rectangleDonnee.innerHTML = `<p style="color:red;">❌ Fonction d'affichage équipement non disponible</p>`;
                }
            }

            const endTime = performance.now();
            console.log(`Temps écoulé pour l'affichage des données : ${(endTime - startTime).toFixed(2)} ms`);
        } catch (error) {
            rectangleDonnee.innerHTML = `<p style="color:red;">❌ Erreur de récupération : ${error.message}</p>`;
            console.error("Erreur lors de la récupération ou du traitement :", error);

            rectangleDonnee.innerHTML += `<p style="color:red;"> Message d'erreur : ${error.message}</p>`;
        }

    } catch (error) {
        console.error("Erreur générale:", error);
        rectangleDonnee.innerHTML = `<p style="color:red;">❌ Erreur générale : ${error.message}</p>`;
    } finally {
        resetButton();
        $('#rectangleDonnee').show();
    }
}

// Fonction d'initialisation sécurisée
function initializeEventListeners() 
{    
    const detailsButton = document.getElementById("detailsButton");
    const zoneTexte = document.getElementById('zone_texte');

    $(document).on('keydown', function(event)
    {
        if (event.keyCode === 13)
        {
            event.preventDefault();
            
            const serviceId = document.getElementById("zone_texte")?.value || "";
            $('#Bouton').html('<b>Vérification en cours</b> <i class="fas fa-spinner fa-spin"></i>').attr('disabled', true);

            if (serviceId.includes("pbb")) {
                const ipInput = document.getElementById('ipInput');
                const slotInput = document.getElementById('slotInput');

                const ipValue = ipInput ? ipInput.value.trim() : "";
                const slotValue = slotInput ? slotInput.value.trim() : "";

                console.log("IP saisie :", ipValue || "(vide)");
                console.log("Slot saisi :", slotValue || "(vide)");

                afficherData(serviceId.toLowerCase(), ipValue, slotValue);
            } else {
                afficherData(serviceId);
            }
            $('#rectangleDonnee').show();
        }
    });
    
    $(document).on('click', '#Bouton', function()
    {
        const serviceId = document.getElementById("zone_texte")?.value || "";
        $('#Bouton').html('<b>Vérification en cours</b> <i class="fas fa-spinner fa-spin"></i>').attr('disabled', true);

        if (serviceId.includes("pbb")) {
            const ipInput = document.getElementById('ipInput');
            const slotInput = document.getElementById('slotInput');

            const ipValue = ipInput ? ipInput.value.trim() : "";
            const slotValue = slotInput ? slotInput.value.trim() : "";

            console.log("IP saisie :", ipValue || "(vide)");
            console.log("Slot saisi :", slotValue || "(vide)");

            afficherData(serviceId.toLowerCase(), ipValue, slotValue);
        } else {
            afficherData(serviceId);
        }

        $('#rectangleDonnee').show();
    });

    if (detailsButton) {
        detailsButton.addEventListener("click", () => {
            const inputValue = document.getElementById("zone_texte")?.value || "";
            if (inputValue) {
                $('#detailsButton').html('<b>Analyse en cours</b> <i class="fas fa-spinner fa-spin"></i>').attr('disabled', true);
                
                afficherData(inputValue + "_Details").finally(() => {
                    $('#detailsButton').html('<b>Analyse avec détails</b>').attr('disabled', false);
                });
            }
        });
    }

    if (zoneTexte) {
        zoneTexte.addEventListener('input', checkConditions);
    }
}

function updateRectangleBleuHeight() {
    const rectangleDonnee = document.getElementById('rectangleDonnee');
    const rectangleBleu = document.getElementById('rectangleBleu');
    const offset = 20;

    if (rectangleDonnee && rectangleBleu) {
        const rectDonnee = rectangleDonnee.getBoundingClientRect();
        const rectBleu = rectangleBleu.getBoundingClientRect();

        const distanceBottom = (rectDonnee.top + rectDonnee.height + offset) - rectBleu.top;

        rectangleBleu.style.height = `${distanceBottom}px`;
    }
}

// Gestion de l'affichage conditionnel
function checkConditions() {
    const zoneTexte = document.getElementById('zone_texte');
    const ipInput = document.getElementById('ipInput');
    const slotInput = document.getElementById('slotInput');
    const detailsButton = document.getElementById('detailsButton');
    const rectangleIDservice = document.getElementById('rectangleIDservice');

    if (!zoneTexte) return;

    const inputValue = zoneTexte.value.toUpperCase();
    const showExtraFields = inputValue.includes("PBB");
    const showDetailsBtn = inputValue.includes("FTTH") || inputValue.includes("FTTHPRO") || inputValue.includes("COVP") || inputValue.includes("OSEN") ||inputValue.includes("XGSP");

    if (ipInput) ipInput.classList.toggle('hidden', !showExtraFields);
    if (slotInput) slotInput.classList.toggle('hidden', !showExtraFields);
    if (rectangleIDservice) rectangleIDservice.classList.toggle('has-multiple-inputs', showExtraFields);
    if (detailsButton) detailsButton.classList.toggle('hidden', !showDetailsBtn);
}

// Initialisation au chargement du DOM
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM chargé, initialisation des événements...');
    
    // Vérifier si jQuery UI est disponible
    if (typeof $.ui !== 'undefined') {
        console.log('jQuery UI détecté, les accordéons seront activés');
    } else {
        console.warn('jQuery UI non détecté, utilisation de l\'affichage classique');
    }
    
    initializeEventListeners();
    updateRectangleBleuHeight();
    
    // Observer pour le redimensionnement
    const rectangleDonnee = document.getElementById('rectangleDonnee');
    if (rectangleDonnee) {
        const observer = new ResizeObserver(updateRectangleBleuHeight);
        observer.observe(rectangleDonnee);
    }
});

// Appel au redimensionnement de la fenêtre
window.addEventListener('resize', updateRectangleBleuHeight);
window.addEventListener('load', updateRectangleBleuHeight);