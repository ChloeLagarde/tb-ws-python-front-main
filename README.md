# 📁 Architecture du Front `valid_mes`

## Structure des dossiers

```
valid_mes/
│
├── js_equipement/              # Gère la partie "équipement"
│   ├── AffichageEquipment.js
│   ├── equipment.js
│   ├── mappingEMUX.js
│   └── valid_mes_wdm.js
│
├── js_service/                 # Gère la partie "services"
│   ├── Affichage_service/
│   │   ├── afficherCOR.js
│   │   ├── afficherEDG.js
│   │   ├── afficherFTTH.js
│   │   ├── afficherNTE.js
│   │   ├── afficherOAM.js
│   │   ├── afficherOLT.js
│   │   ├── afficherOLT5800.js
│   │   ├── afficherSWA.js
│   │   └── afficherVPLS.js
│   ├── Affichage_service.js
│   ├── Modif_Nego.js
│   └── service.js
│
├── valid_mes_Test.html         # Fichier principal pour interface de test
├── valid_mes.css               # Feuille de style
└── valid_mes.js                # Script principal (connexion tb-ws-python + lancement équipement/service)
```

---

## 🧪 Tests en local

1. **Installer l’extension Live Server dans VS Code.**
2. Un bouton **"Go Live"** apparaît en bas à droite.
3. Cliquez dessus : une interface s’ouvre automatiquement dans votre navigateur.
4. Naviguez jusqu’au fichier `valid_mes_Test.html` et ouvrez-le.
5. Le comportement est identique à `valid_mes`, mais en local.
6. Envoyer vos codes sur le git c'est classique il faut faire la méthode habituelle (git add . , git commit -m "Initial commit" , et git push -u origin prod)

---

## 🚀 Déploiement

> ⚠️ Attention aux **chemins de fichiers**, ils diffèrent de la version locale. Ne pas copier/coller en bloc sans adaptation.

### Emplacements sur le serveur

| Fichier ou Dossier                | Emplacement Serveur                                 |
|----------------------------------|------------------------------------------------------|
| `valid_mes_Test.html`            | `~/toolbox/geco/valid_mes_test.html`                |
| `valid_mes.js`                   | `~/toolbox/js/geco/valid_mes_AR`                |
| `valid_mes.css`                  | `~/toolbox/css/geco/valid_mes_test.css`                  |
| `Affichage_service.js`, etc.     | `~/toolbox/js/geco/`                                 |
| `js_service/`                    | `~/toolbox/js/geco/js_service/`                      |
| `js_equipement/`                 | `~/toolbox/js/geco/js_equipement/`                  |

---

### Étapes de déploiement

1. **Se connecter au serveur distant :**

   ```bash
   ssh vma-prdweb-34.pau
   ```

2. **Récupérer les modifications :**

   ```bash
   sudo git pull
   ```

3. **Valider les fichiers modifiés :**

   ```bash
   sudo git add votre_fichier.extension   # ou sudo git add -A
   sudo git commit -m "Votre message"
   sudo git push
   ```

4. **Mettre à jour les fichiers dans le répertoire web :**

   ```bash
   cd /data/www/toolbox
   sudo git pull
   ```

5. **Recharger la page dans le navigateur (Ctrl + F5) :**

   - [https://toolbox.int.axione.fr/geco/valid_mes_test.html](https://toolbox.int.axione.fr/geco/valid_mes_test.html)

---

### 🔐 Remarques importantes

- Vous devez **être connecté au VPN** pour accéder aux ressources internes.
- Toujours vérifier les **chemins absolus** avant de déployer.

---
