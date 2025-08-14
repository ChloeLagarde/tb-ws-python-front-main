export async function envoyerRequetNego(commande) {
    // Sauvegarder la méthode originale de console.log
    const originalConsoleLog = console.log;

    // Variable pour stocker le dernier log
    let dernierLog = null;

    // Redéfinir console.log pour capturer le dernier message
    console.log = function(...messages) {
        dernierLog = messages.join(" "); // Concatène les messages dans une chaîne
        originalConsoleLog.apply(console, arguments); // Appelle l'original
    };

    const hostM2M = "https://tb-ws-python.m2m.axione.fr";
    const hostINT = "https://tb-ws-python.int.axione.fr";

    // Vérifier si l'hôte M2M est accessible
    const isHostM2MReachable = await pingURL(hostM2M);
    const baseUrl = isHostM2MReachable ? hostM2M : hostINT;

    const encodedCommande = encodeURIComponent(commande);
    const url = `${baseUrl}/command/snmp/${encodedCommande}`;

    console.log("URL encodée:", url);

    try {
        // Effectuer la requête avec l'URL choisie
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error(`Erreur HTTP : ${response.status}`);
        }

        const data = await response.json();
        console.log("Réponse JSON:", data);

        // Extraire l'entier à partir du champ "output"
        const match = data.output.match(/INTEGER:\s(\d+)/);

        if (match) {
            const integerValue = parseInt(match[1], 10);
            console.log('Valeur extraite :', integerValue);
            return { result: integerValue, dernierLog };
        } else {
            console.warn("Aucune valeur INTEGER trouvée.");
            return { result: null, dernierLog };
        }
    } catch (error) {
        console.error("Erreur de la requête:", error);
        throw new Error(`Erreur lors de l'envoi de la commande : ${error.message}`);
    } finally {
        // Rétablir la méthode originale de console.log
        console.log = originalConsoleLog;
    }
}

async function pingURL(url) {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1000); // Limite à 1 seconde

        const response = await fetch(url, { method: 'HEAD', signal: controller.signal });
        clearTimeout(timeoutId);
        return response.ok ? 1 : 0;
    } catch {
        return 0;
    }
}
