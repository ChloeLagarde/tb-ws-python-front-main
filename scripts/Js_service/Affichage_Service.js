import * as Function from './service.js';
import { genererListeNego } from './Modif_Nego.js';
import { COR } from './Affichage_Service/afficherCOR.js';
import { EDG } from './Affichage_Service/afficherEDG.js';
import { FTTH } from './Affichage_Service/afficherFTTH.js';
import { NTE } from './Affichage_Service/afficherNTE.js';
import { OAM } from './Affichage_Service/afficherOAM.js';
import { OLT } from './Affichage_Service/afficherOLT.js';
import { OLT5800 } from './Affichage_Service/afficherOLT5800.js';
import { SWA } from './Affichage_Service/afficherSWA.js';
import { VPLS } from './Affichage_Service/afficherVPLS.js';
import { MPE } from './Affichage_Service/afficherMPE.js';
import {FTTHNCS} from './Affichage_Service/afficherFTTHNCS.js';
import { OSENXGSP } from './Affichage_Service/afficherOSENXGSP.js';
import {SDSL} from './Affichage_Service/afficherSDSL.js'

export function validationDonnee(dataToDisplay, verifNTE) {
    for (let i = 0; i < dataToDisplay.length; i++) {
        if (!dataToDisplay[i]["equipment name"]) {
            continue;
        }

        const equipmentName = dataToDisplay[i]["equipment name"];
        const parts = equipmentName.split("-");
        const verif = parts[1];

        if (verifNTE === verif) {
            const validationRX = dataToDisplay[i]["Validation_Puissance_Optique_NTE_RX"];
            const validationTX = dataToDisplay[i]["Validation_Puissance_Optique_NTE_TX"];

            if (typeof validationRX !== 'undefined' && typeof validationTX !== 'undefined') {
                return [validationRX, validationTX];
            }
        }
    }

    return ["1", "1"];
}

export class AfficherService {
    constructor(dataToDisplay, equipmentName, ip, equipmentInfo, snmpInfo, port, portNetwork, snmpNetwork, accesPhysique, validation, idTechnique, adressesMAC, sshInfo, command, portNetwork2 = null, snmpNetwork2 = null) {
        this.dataToDisplay = dataToDisplay;
        this.equipmentName = equipmentName;
        this.ip = ip;
        this.equipmentInfo = equipmentInfo;
        this.snmpInfo = snmpInfo;
        this.port = port;
        this.portNetwork = portNetwork;
        this.snmpNetwork = snmpNetwork;
        this.accesPhysique = accesPhysique;
        this.validation = validation;
        this.idTechnique = idTechnique;
        this.adressesMAC = adressesMAC;
        this.sshInfo = sshInfo;
        this.command = command;
        this.portNetwork2 = portNetwork2;
        this.snmpNetwork2 = snmpNetwork2;
    }

    static fromDataToDisplay(dataToDisplay, item) {
        const equipmentName = item["equipment name"];
        if (!equipmentName || typeof equipmentName !== 'string') {
            console.warn(`⚠️ L'équipement est invalide : ${JSON.stringify(item)}`);
            return null;
        }

        const ip = item["ip"];
        const equipmentInfo = item["equipment_info"];
        const snmpInfo = item["snmp info"];
        const port = item["port"];
        const portNetwork = item["port_network"];
        const snmpNetwork = item["snmp info Network"] || item["snmp info network"];
        const portNetwork2 = item["Port network 2"] || null;
        const snmpNetwork2 = item["snmp info network 2"] || null;
        const accesPhysique = item["acces"];
        const idTechnique = item["ID Technique"];
        const adressesMAC = item["Vpls"];
        const sshInfo = item["ssh info"];
        const command = item["Commande"] || null;
        const validation = validationDonnee(dataToDisplay, equipmentName.split("-")[1]);

        return new AfficherService(
            dataToDisplay,
            equipmentName,
            ip,
            equipmentInfo,
            snmpInfo,
            port,
            portNetwork,
            snmpNetwork,
            accesPhysique,
            validation,
            idTechnique,
            adressesMAC,
            sshInfo,
            command,
            portNetwork2,
            snmpNetwork2
        );
    }

    getCOR() {
        return COR(this.equipmentName, this.snmpInfo, this.port);
    }

    getEDG() {
        return EDG(this.snmpInfo, this.equipmentName, this.ip, this.port);
    }

    getFTTH() {
        try {
            const html = FTTH(this.dataToDisplay);
            if (!html) {
                console.warn("⚠️ FTTHNCS n'a rien retourné dans getFTTH()");
                return "<p style='color:red;'>Aucune donnée FTTH à afficher.</p>";
            }
            return html;
        } catch (err) {
            console.error("❌ Erreur dans getFTTH :", err);
            return "<p style='color:red;'>Erreur lors de l'affichage FTTH.</p>";
        }
    }

    getFTTHNCS() {
        try {
            const html = FTTHNCS(this.dataToDisplay);
            return html || "<p style='color:red;'>Aucune donnée FTTHNCS.</p>";
        } catch (e) {
            console.error("❌ Erreur dans getFTTHNCS :", e);
            return "<p style='color:red;'>Erreur lors de l'affichage FTTHNCS.</p>";
        }
    }

    getNTE() {
        return NTE(
            this.snmpInfo,
            this.equipmentName,
            this.portNetwork,
            this.port,
            this.snmpNetwork,
            this.validation,
            this.ip,
            this.accesPhysique,
            this.command,
            this.portNetwork2,
            this.snmpNetwork2
        );
    }

    getOAM() {
        return OAM(this.dataToDisplay, this.ip);
    }

    getOLT() {
        return OLT(this.ip, this.sshInfo, this.equipmentName);
    }

    getOLT5800() {
        return OLT5800(this.snmpInfo, this.equipmentName, this.port);
    }

    getSWA() {
        return SWA(this.equipmentName, this.port, this.snmpInfo, this.snmpNetwork);
    }

    getVPLS() {
        return VPLS(this.equipmentName, this.idTechnique, this.adressesMAC);
    }

    getMPE() {
        return MPE(this.snmpInfo, this.equipmentName, this.ip, this.port);
    }

    getOSEN_XGSP() {
        try {
            const html = OSENXGSP(this.dataToDisplay);
            return html || "<p>Aucune donnée OSEN/XGSP</p>";
        } catch (e) {
            console.error("❌ Erreur dans getOSEN_XGSP :", e);
            return "<p>Erreur OSEN/XGSP</p>";
        }
    }

    getSDSL() {
        try {
            const html = SDSL(this.dataToDisplay);
            return html || "<p>Aucune donnée SDSL</p>";
        } catch (e) {
            console.error("❌ Erreur dans getSDSL :", e);
            return "<p>Erreur SDSL</p>";
        }
    }
}
