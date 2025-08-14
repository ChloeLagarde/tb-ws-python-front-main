import { envoyerRequetNego } from "./envoyerRequeteNego.js";

// Fonction pour formater le port
export function formaterPort(port) {
    const chiffres = port.match(/\d+/g);
    if (!chiffres || chiffres.length < 3) {
        throw new Error("Le port n'a pas assez de chiffres");
    }
    return chiffres.slice(0, 4).join('.');
}

// Fonction pour obtenir le code de négociation en fonction de l'adresse du port et de l'option de négociation
function getNegoCode(port_nte, nego) {
    const negoMaps = {
        ipv4: {
            "auto": 7,
            "100MB-full": 3,
            "auto-100MB-full": 10,
            "1000MB-full": 5,
            "auto-1000MB-full": 12,
            "full": 2,
        },
        nte: {
            "full": 2,
            "auto": 1
        },
    };

    const isIpv4 = port_nte.match(/\d+\.\d+\.\d+\.\d+/);
    const isNte = port_nte.match(/\d+\.\d+\.\d+/);
    const map = isIpv4 ? negoMaps.ipv4 : isNte ? negoMaps.nte : null;

    return map ? map[nego] : undefined;
}

// Fonction principale pour traiter la commande de négociation
export function traiterCommande(ip, port, nego, callback) {
    const port_nte = formaterPort(port);
    const ip_nte = ip.split(' ')[0];
    const code = getNegoCode(port_nte, nego);

    if (code === undefined) {
        callback(null, "Valeur de négociation non valide");
        return;
    }

    const isIpv4 = port_nte.match(/\d+\.\d+\.\d+\.\d+/);
    const commande = isIpv4
        ? `snmpset -v2c -c private ${ip_nte} .1.3.6.1.4.1.2544.1.12.4.1.1.1.9.${port_nte} i ${code}`
        : `snmpset -v2c -c cpdea ${ip_nte} .1.3.6.1.4.1.738.1.5.100.2.2.2.1.14.${port_nte} i ${code}`;

    console.log(`Commande: ${commande}`);

    envoyerRequetNego(commande)
        .then(data => callback(data.result, data.dernierLog))
        .catch(error => callback(null, `Erreur SNMP : ${error.message}`));
}

// Fonction pour générer la liste de négociation basée sur le type de port et d'option de négociation
export function genererListeNego(port_nte, nego, acces_physique, ip_nte) {
    const optionsMap = {
        "1000BASE-TX": ["auto-1000MB-full", "auto"],
        "100BASE-TX": ["100MB-full", "auto-100MB-full", "auto"],
        "1000BASE-RX": ["1000MB-full", "auto-1000MB-full", "auto"],
        "1000MB-FULL": ["auto-1000MB-full"],
        "DEFAULT": ["auto"]
    };

    const accesPhysiqueUpper = (acces_physique || "").toUpperCase();
    const disponibles = optionsMap[accesPhysiqueUpper] || optionsMap["DEFAULT"];
    const selectId = `negoSelect-${port_nte}`;

    const selectHtml = `
        <select id='${selectId}' class='nego-select'
            data-port-nte='${port_nte}' data-ip='${ip_nte}' data-current='${nego}' data-acces-physique='${acces_physique}'
            onchange='window.handleNegoChange(event, "${ip_nte}")'
            onclick='window.handleNegoClickUnique(event, "${ip_nte}")'>
            ${disponibles.map(option => {
                const isSelected = option === nego;
                const label = `${option}${isSelected ? " ✔ Actif" : ""}`;
                return `<option value='${option}' ${isSelected ? "selected" : ""}>
                    ${label}
                </option>`;
            }).join("")}
        </select>`;

    return `<div class='select-section'>${selectHtml}</div>`;
}


// Fonction appelée lors de la modification de la négociation
window.handleNegoChange = function (event, ip) {
    const newValue = event.target.value;
    const previousValue = event.target.getAttribute("data-current");
    const port_nte = event.target.getAttribute("data-port-nte");
    const ip_nte = event.target.getAttribute("data-ip");
    const acces_physique = (event.target.getAttribute("data-acces-physique") || "").toUpperCase();

    if (confirm(`Appliquer la négociation "${newValue}" sur ${port_nte} ?`)) {
        traiterCommande(ip_nte, port_nte, newValue, function (resultat, error) {
            const foundValue = getNegoLabel(resultat);
            const speedDuplexElement = document.getElementById(`speed-duplex-${ip}`);
            const chevronElement = document.getElementById(`chevron-${ip}`);

            if (speedDuplexElement) {
                const isChevronDown = chevronElement && chevronElement.classList.contains("down");
                speedDuplexElement.innerHTML = `${foundValue || "Valeur inconnue"} <span class="chevron" id="chevron-${ip}">▶</span>`;
                if (isChevronDown) document.getElementById(`chevron-${ip}`).classList.add("down");
            }

            // ✅ Mettre à jour dynamiquement les options avec le bon "✔ Actif"
            const optionsMap = {
                "1000BASE-TX": ["auto-1000MB-full", "auto"],
                "100BASE-TX": ["100MB-full", "auto-100MB-full", "auto"],
                "1000BASE-RX": ["1000MB-full", "auto-1000MB-full", "auto"],
                "1000MB-FULL": ["auto-1000MB-full"],
                "DEFAULT": ["auto"]
            };

            const options = optionsMap[acces_physique] || optionsMap["DEFAULT"];
            event.target.innerHTML = options.map(option => {
                const isSelected = option === newValue;
                return `<option value='${option}' ${isSelected ? "selected" : ""}>
                    ${option}${isSelected ? " ✔ Actif" : ""}
                </option>`;
            }).join("");

            event.target.setAttribute("data-current", newValue);
        });
    } else {
        event.target.value = previousValue;
    }
};

// Fonction utilisée lors du clic sur un élément de négociation unique (ex: avec une seule option)
window.handleNegoClickUnique = function (event, ip) {
    const select = event.target;
    const current = select.getAttribute("data-current");

    if (select.options.length === 1 && select.value === current) {
        if (confirm(`Répéter la négociation "${current}" ?`)) {
            const port_nte = select.getAttribute("data-port-nte");
            const ip_nte = select.getAttribute("data-ip");

            traiterCommande(ip_nte, port_nte, current, function (resultat, error) {
                const foundValue = getNegoLabel(resultat);
                const speedDuplexElement = document.getElementById(`speed-duplex-${ip}`);
                const chevronElement = document.getElementById(`chevron-${ip}`);

                if (speedDuplexElement) {
                    const isChevronDown = chevronElement && chevronElement.classList.contains("down");
                    speedDuplexElement.innerHTML = `${foundValue || "Valeur inconnue"} <span class="chevron" id="chevron-${ip}">▶</span>`;
                    if (isChevronDown) document.getElementById(`chevron-${ip}`).classList.add("down");
                }
            });
        }
    }
};

// Fonction pour obtenir le label correspondant au code de négociation
function getNegoLabel(code) {
    const map = {
        "7": "auto",
        "3": "100MB-full",
        "10": "auto-100MB-full",
        "5": "1000MB-full",
        "12": "auto-1000MB-full",
        "2": "full",
        "1": "auto"
    };
    return map[code];
}
