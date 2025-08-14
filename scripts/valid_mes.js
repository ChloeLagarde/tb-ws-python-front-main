import afficherDonneesService from './Js_service/service.js';
import afficherDonneesEquipment from './Js_equipment/equipment.js';
import { afficherService } from './Js_equipment/Affichage_Equipment.js';


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

// Fonction principale d'affichage
async function afficherData(input, ip = "", slot = "") {
    if (!input) {
        alert("Veuillez remplir le champ ID Service");
        resetButton(); // Remettre le bouton à l'état normal
        return;
    }

    const rectangleDonnee = document.getElementById("rectangleDonnee");
    if (!rectangleDonnee) {
        console.error("Élément rectangleDonnee non trouvé");
        resetButton(); // Remettre le bouton à l'état normal
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

        // Si ce n'est PAS un service connu, appeler directement afficherService
        if (!isService) {
            console.log("Input ne fait pas partie des types de service connus, appel direct d'afficherService");
            
            let url;
            
            // NOUVELLE LOGIQUE : Détecter automatiquement si l'input contient un underscore (équipement_ip)
            let equipmentName = input;
            let detectedPort = ip;
            
            // Si l'input contient un underscore, séparer le nom d'équipement de l'IP/port
            if (input.includes('_')) {
                const parts = input.split('_');
                equipmentName = parts[0];
                detectedPort = parts.slice(1).join('_'); // Rejoindre les parties après le premier underscore
                
                console.log(`Séparation détectée - Équipement: ${equipmentName}, Port: ${detectedPort}`);
                
                // Construire l'URL avec le nom complet encodé (équipement_port)
                url = `${baseUrl}equipment/${encodeURIComponent(input)}`;
            } else if (input.includes("PBB")) {
                // Logique existante pour PBB avec paramètres séparés
                const params = [];
                if (ip) params.push(`port=${encodeURIComponent(ip)}`);
                if (slot) params.push(`slot=${encodeURIComponent(slot)}`);
                const queryString = params.length ? `?${params.join("&")}` : "";
                url = `${baseUrl}equipment/${input}${queryString}`;
            } else {
                // Cas standard sans underscore ni PBB
                url = `${baseUrl}equipment/${input}`;
            }

            const startTime = performance.now();
            console.log("URL appelée :", url);

            const loadingMessage = document.createElement("div");
            loadingMessage.className = "loader";
            loadingMessage.innerText = `Envoi de la requête à l'équipement ${equipmentName}${detectedPort ? ` (port: ${detectedPort})` : ''}`;
            
            //rectangleDonnee.appendChild(loadingMessage);

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

                    // Ping + vérification du contenu
                    pingReporting(url).then(status1 => {
                        rectangleDonnee.innerHTML += `
                            <p>
                                Ping + contenu <code>${url}</code> : ${status1}
                            </p>
                        `;
                    });

                    return;
                }

                // Appel direct d'afficherService pour les inputs non reconnus
                const htmlContent = afficherService(data);
                rectangleDonnee.innerHTML = htmlContent;

                const endTime = performance.now();
                console.log(`Temps écoulé pour l'affichage des données : ${(endTime - startTime).toFixed(2)} ms`);

            } catch (error) {
                rectangleDonnee.innerHTML = `<p style="color:red;">❌ Erreur de récupération : ${error.message}</p>`;
                console.error("Erreur lors de la récupération ou du traitement :", error);
            }
            
            return; // Sortir de la fonction ici
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

        const loadingMessage = document.createElement("div");
        loadingMessage.className = "loader";
        loadingMessage.innerText = `Envoi de la requête ${isService ? 'au service' : 'à l\'équipement'} ${input}`;
        
        //rectangleDonnee.appendChild(loadingMessage);

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

                // Premier ping + vérification du contenu
                pingReporting(url).then(status1 => {
                    rectangleDonnee.innerHTML += `
                        <p>
                            Ping + contenu <code>${url}</code> : ${status1}
                        </p>
                    `;
                });

                // Deuxième ping + vérification sur l'URL ORDS
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
                    afficherDonneesService(data, input);
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
        // S'assurer que le bouton est TOUJOURS remis à l'état normal
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