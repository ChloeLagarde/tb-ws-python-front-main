from flask import Flask, jsonify, request
from flask_cors import CORS
import urllib3
import requests

# Désactiver les avertissements de sécurité pour les requêtes HTTPS non sécurisées
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# Initialisation de l'application Flask
app = Flask(__name__)
CORS(app, resources={r"/fetch-data": {"origins": "http://127.0.0.1:5500"}})

def fetch_json_via_proxy(url):
    """
    Fonction pour effectuer une requête GET via un proxy et retourner la réponse JSON.
    """
    proxies = {
        'https': 'http://10.1.80.5:80'  # Proxy utilisé pour les requêtes HTTPS
    }

    try:
        response = requests.get(url, proxies=proxies, verify=False, timeout=60)
        response.raise_for_status()  # Lève une exception pour les codes de statut HTTP 4xx/5xx
        json_data = response.json()  # Analyse la réponse en JSON
        return json_data
    except requests.RequestException as e:
        return {"error": f"Erreur lors de la requête : {e}"}
    except ValueError as e:
        return {"error": f"Erreur lors du décodage JSON : {e}"}

@app.route('/fetch-data', methods=['GET'])
def fetch_data_route():
    """
    Point de terminaison pour récupérer les données en utilisant l'URL fournie en paramètre.
    """
    url = request.args.get('url')
    if not url:
        return jsonify({"error": "Le paramètre 'url' est requis"}), 400 
    data = fetch_json_via_proxy(url)
    return jsonify(data)

if __name__ == '__main__':
    # Démarrage de l'application Flask
    app.run(host='0.0.0.0', port=8080)
