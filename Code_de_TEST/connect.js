// Définition du constructeur CallServer
function CallServer() {
    this.xhr_object = null;
    this.server_response = "";

    this.createXMLHTTPRequest = createXMLHTTPRequest;
    this.sendDataToServer = sendDataToServer;
    this.displayAnswer = displayAnswer;
    this.launch = launch;
}

// Création de l'objet XMLHttpRequest
function createXMLHTTPRequest() {
    if (window.XMLHttpRequest) {
        this.xhr_object = new XMLHttpRequest();
    } else if (window.ActiveXObject) {
        // Pour les anciennes versions d'IE
        try {
            this.xhr_object = new ActiveXObject("Microsoft.XMLHTTP");
        } catch (e) {
            alert("Votre navigateur ne supporte pas ActiveXObject.");
            return;
        }
    } else {
        alert("Votre navigateur ne supporte pas la fonctionnalité XMLHttpRequest.");
        return;
    }
}

// Envoi de données au serveur en mode synchrone
function sendDataToServer(data_to_send) {
    var xhr = this.xhr_object;
    if (!xhr) {
        alert("L'objet XMLHttpRequest n'est pas créé.");
        return;
    }
    
    // Ouverture de la connexion en mode POST (synchrone)
    xhr.open("POST", "connect.pl", false);

    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    
    // Envoi des données
    xhr.send(data_to_send);
    
    // Vérification du statut HTTP
    if (xhr.readyState === 4) {
        if (xhr.status === 200) {
            this.server_response = xhr.responseText;
        } else {
            this.server_response = "Erreur lors de la requête : " + xhr.status + " " + xhr.statusText;
        }
    }
}

// Injection de la réponse du serveur dans l'élément HTML d'id "resultat"
function displayAnswer() {    
    var resultatDiv = document.getElementById("resultat");
    if (resultatDiv) {
        resultatDiv.innerHTML = this.server_response;
    } else {
        alert("L'élément avec l'id 'resultat' est introuvable dans le DOM.");
    }
}

// Fonction déclencheuse : récupère la valeur de l'élément 'url', envoie les données et affiche la réponse
function launch() {
    var urlField = document.getElementById("url");
    if (urlField) {
        // Encodage de la valeur et préparation des données pour le POST
        var data = "url=" + encodeURIComponent(urlField.value);
        this.sendDataToServer(data);
        this.displayAnswer();
    } else {
        alert("L'élément avec l'id 'url' est introuvable dans le DOM.");
    }
}

// Instanciation et création de l'objet XMLHttpRequest
var call_server = new CallServer();
call_server.createXMLHTTPRequest();
