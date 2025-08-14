import { toggleContent } from "./Affichage_Equipment.js";

function createPortHeader(port) {
    const portHeaderElement = document.createElement('p');
    portHeaderElement.textContent = port + ':';

    const toggleIcon = document.createElement('i');
    toggleIcon.classList.add('fas', 'fa-chevron-down', 'toggle-icon');
    toggleIcon.onclick = toggleContent;

    portHeaderElement.appendChild(toggleIcon);
    return portHeaderElement;
}

function createPortContent(portContent, fieldsMapping, portData) {
    Object.keys(fieldsMapping).forEach(key => {
        if (portData[key] !== undefined) {
            const element = document.createElement('p');
            element.textContent = `${fieldsMapping[key]} : ${portData[key]}`;
            portContent.appendChild(element);
        }
    });
}

function displayPorts(equipement, emuxResultatDiv, fieldsMapping) {
    Object.keys(equipement).forEach(port => {
        if (port.startsWith('Port ')) {
            const portData = equipement[port];

            const portHeaderElement = createPortHeader(port);
            emuxResultatDiv.appendChild(portHeaderElement);

            const portContent = document.createElement('div');
            portContent.classList.add('hidden-content');
            emuxResultatDiv.appendChild(portContent);

            createPortContent(portContent, fieldsMapping, portData);
        }
    });
}

export const MappingEMUX = {
    "1001RR": (equipement, emuxResultatDiv) => {
        const properties = [
            { key: 'Client Rx Power', label: 'Client Rx Power' },
            { key: 'Client Tx Power', label: 'Client Tx Power' },
            { key: 'Client Temp', label: 'Client Temp' },
            { key: 'Line Rx Power', label: 'Line Rx Power' },
            { key: 'Line Tx Power', label: 'Line Tx Power' },
            { key: 'Line Temp', label: 'Line Temp' }
        ];
        displayPorts(equipement, emuxResultatDiv, properties);
    },
    "C1001HC": (equipement, emuxResultatDiv) => {
        const properties = [
            { key: 'Client Rx Power', label: 'Client Rx Power' },
            { key: 'Client Tx Power', label: 'Client Tx Power' },
            { key: 'Client Traffic In', label: 'Client Traffic In' },
            { key: 'Client Traffic Out', label: 'Client Traffic Out' },
            { key: 'Client Traffic Input CRC', label: 'Client Traffic Input CRC' },
            { key: 'Client Traffic Output CRC', label: 'Client Traffic Output CRC' },
            { key: 'Client Temp', label: 'Client Temp' },
            { key: 'Line Rx Power', label: 'Line Rx Power' },
            { key: 'Line Tx Power', label: 'Line Tx Power' },
            { key: 'Line Input Errors', label: 'Line Input Errors' },
            { key: 'Line Temp', label: 'Line Temp' }
        ];
        displayPorts(equipement, emuxResultatDiv, properties);
    },
    "PM404": (equipement, emuxResultatDiv) => {
        const properties = [
            { key: 'Client Rx Power', label: 'Client Rx Power' },
            { key: 'Client Tx Power', label: 'Client Tx Power' },
            { key: 'Client Temp', label: 'Client Temp' },
            { key: 'Line Rx Power', label: 'Line Rx Power' },
            { key: 'Line Tx Power', label: 'Line Tx Power' },
            { key: 'Line Temp', label: 'Line Temp' }
        ];
        displayPorts(equipement, emuxResultatDiv, properties);
    },
    "PMOAB": (equipement, emuxResultatDiv) => {
        const properties = [
            { key: 'Booster Rx Power', label: 'Booster Rx Power' },
            { key: 'Booster Tx Power', label: 'Booster Tx Power' },
            { key: 'Booster Gain', label: 'Booster Gain' },
            { key: 'Booster pump laser bias', label: 'Booster pump laser bias' },
            { key: 'Pre-Amp Rx Power', label: 'Pre-Amp Rx Power' },
            { key: 'Pre-Amp Tx Power', label: 'Pre-Amp Tx Power' },
            { key: 'Pre-Amp Gain', label: 'Pre-Amp Gain' },
            { key: 'Pre-Amp pump laser bias', label: 'Pre-Amp pump laser bias' },
            { key: 'module Temp', label: 'module Temp' }
        ];
        displayPorts(equipement, emuxResultatDiv, properties);
    },
    "ROADM": (equipement, emuxResultatDiv) => {
        const properties = [
            { key: 'Channel number', label: 'Channel number' },
            { key: 'Channel power In', label: 'Channel power In' },
            { key: 'Channel power Out', label: 'Channel power Out' }
        ];
        displayPorts(equipement, emuxResultatDiv, properties);
    },
    "OTDR": (equipement, emuxResultatDiv) => {
        const properties = [
            { key: 'Temp', label: 'Temp' },
            { key: 'RX Power', label: 'RX Power' },
            { key: 'TX Power', label: 'TX Power' },
            { key: 'OTDR Fault Distance', label: 'OTDR Fault Distance' }
        ];
        displayPorts(equipement, emuxResultatDiv, properties);
    },
    "OABP-HCS": (equipement, emuxResultatDiv) => {
        const properties = [
            { key: 'Temperature', label: 'Temperature' },
            { key: 'Booster Rx Power', label: 'Booster Rx Power' },
            { key: 'Booster Tx Power', label: 'Booster Tx Power' },
            { key: 'Booster Gain', label: 'Booster Gain' },
            { key: 'Booster pump laser bias', label: 'Booster pump laser bias' },
            { key: 'Pre-Amp Rx', label: 'Pre-Amp Rx' },
            { key: 'Pre-Amp Tx', label: 'Pre-Amp Tx' },
            { key: 'Pre-Amp Gain', label: 'Pre-Amp Gain' },
            { key: 'Pre-Amp pump laser bias', label: 'Pre-Amp pump laser bias' }
        ];
        displayPorts(equipement, emuxResultatDiv, properties);
    },
    "EMUX": (equipement, emuxResultatDiv) => {
        const properties = [
            { key: 'Line Rx Avg Power', label: 'Line Rx Avg Power' },
            { key: 'Line Tx Avg Power', label: 'Line Tx Avg Power' },
            { key: 'Line Uncorrected FEC Errors', label: 'Line Uncorrected FEC Errors' },
            { key: 'Line Temps', label: 'Line Temps' }
        ];
        displayPorts(equipement, emuxResultatDiv, properties);
    },
    "FRS02": (equipement, emuxResultatDiv) => {
        const properties = [
            { key: 'Line 1 Tx Power', label: 'Line 1 Tx Power' },
            { key: 'Line 1 Rx Power', label: 'Line 1 Rx Power' },
            { key: 'Line Uncorrected FEC Errors', label: 'Line Uncorrected FEC Errors' },
            { key: 'Line 1 Temp', label: 'Line 1 Temp' },
            { key: 'Client Port 1 temperature', label: 'Client Port 1 temperature' },
            { key: 'Client Port 2 temperature', label: 'Client Port 2 temperature' }
        ];
        displayPorts(equipement, emuxResultatDiv, properties);
    },
    "C1008MPLH": (equipement, emuxResultatDiv) => {
        const properties = [
            { key: 'Client Rx Power', label: 'Client Rx Power' },
            { key: 'Client Tx Power', label: 'Client Tx Power' },
            { key: 'Client Input CRC', label: 'Client Input CRC' },
            { key: 'Client Input Error', label: 'Client Input Error' },
            { key: 'Client Output Error', label: 'Client Output Error' },
            { key: 'Client Temp', label: 'Client Temp' },
            { key: 'Line Rx Avg Power', label: 'Line Rx Avg Power' },
            { key: 'Line Tx Avg Power', label: 'Line Tx Avg Power' },
            { key: 'Line Rx Error', label: 'Line Rx Error' },
            { key: 'Line Tx Error', label: 'Line Tx Error' },
            { key: 'Line Uncorrected FEC Errors', label: 'Line Uncorrected FEC Errors' },
            { key: 'Line Temps', label: 'Line Temps' }
        ];
        displayPorts(equipement, emuxResultatDiv, properties);
    },    "C1008GE": function(equipement, emuxResultatDiv) {
        const fieldsMapping = {
            'Client Rx Power': 'Client Rx Power',
            'Client Tx Power': 'Client Tx Power',
            'Client Input CRC': 'Client Input CRC',
            'Client Input Error': 'Client Input Error',
            'Client Output Error': 'Client Output Error',
            'Client Input CRC Error': 'Client Input CRC Error',
            'Client Temp': 'Client Temp',
            'Line Rx Power': 'Line Rx Power',
            'Line Tx Power': 'Line Tx Power',
            'Line Error counter': 'Line Error counter',
            'Line Temp': 'Line Temp'
        };
        displayPorts(equipement, emuxResultatDiv, fieldsMapping);
    },
    "PM_06006": function(equipement, emuxResultatDiv) {
        const fieldsMapping = {
            'Client Rx Power': 'Client Rx Power',
            'Client Tx Power': 'Client Tx Power',
            'Client Traffic In': 'Client Traffic In',
            'Client Input Errors': 'Client Input Errors',
            'Client Output Errors': 'Client Output Errors',
            'Client Temp': 'Client Temp',
            'Line Rx Avg Power': 'Line Rx Avg Power',
            'Line Tx Avg Power': 'Line Tx Avg Power',
            'Line Error counter': 'Line Error counter',
            'Line Temp': 'Line Temp'
        };
        displayPorts(equipement, emuxResultatDiv, fieldsMapping);
    },
    "OAIL-HCS": function(equipement, emuxResultatDiv) {
        const fieldsMapping = {
            'IL1 Rx Power': 'IL1 Rx Power',
            'IL1 Tx Power': 'IL1 Tx Power',
            'IL1 Gain': 'IL1 Gain',
            'IL1 pump laser bias': 'IL1 pump laser bias',
            'module Temp': 'IL1 Temp',
            'IL2 Rx Power': 'IL2 Rx Power',
            'IL2 Tx Power': 'IL2 Tx Power',
            'IL2 Gain': 'IL2 Gain',
            'IL2 pump laser bias': 'IL2 pump laser bias'
        };
        displayPorts(equipement, emuxResultatDiv, fieldsMapping);
    }
};


export default MappingEMUX;