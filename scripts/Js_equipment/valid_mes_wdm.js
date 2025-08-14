
//***************************************************************************************************************
function afficherResultatDNS(data)
{
    var dnsContainer = document.getElementById('dns-container');
    var dnsResultatDiv = document.getElementById('dns-resultat');
    var emuxResultatDiv = document.getElementById('emux-container');
    dnsResultatDiv.innerHTML = '';
    emuxResultatDiv.innerHTML = ''; // Clear previous results

    var dns = data[0]['DNS'];
    var ip = data[0]['Adresse IP'];
    var version = data[0]['Version'];

    var dnsElement = document.createElement('p');
    dnsElement.textContent = 'DNS : ' + dns;

    var infoButton = document.createElement('button');
    infoButton.classList.add('btn-info');
    var infoIcon = document.createElement('i');
    infoIcon.classList.add('fas', 'fa-info-circle');
    infoButton.appendChild(infoIcon);
    infoButton.onmouseenter = function() { afficherInfoTexte(infoButton); };

    dnsElement.appendChild(infoButton);

    var ipElement = document.createElement('p');
    ipElement.textContent = 'IP : ' + ip;

    var versionElement = document.createElement('p');
    versionElement.textContent = 'Version : ' + version;
    if (version != undefined && version.match(/6\.4\.802/))
    {
        versionElement.classList.add('version-special');
        var iconElement = document.createElement('i');
        iconElement.classList.add('fas', 'fa-check-circle', 'icon-special');
        versionElement.appendChild(iconElement);
    } 
    else
    {
        versionElement.classList.add('version-special-red');
        var iconElement = document.createElement('i');
        iconElement.classList.add('fas', 'fa-times-circle', 'icon-special-red');
        iconElement.style.color = '#ff0000'; // Red color for the cross
        versionElement.appendChild(iconElement);
    }

    dnsResultatDiv.appendChild(dnsElement);

    var infoText = document.createElement('div');
    infoText.classList.add('info-text');
    infoText.innerHTML = `
    <p>Toutes les informations ne sont pas affichÃ©es.</p>
    <p>Souhaitez-vous tout afficher ? *Attention, Ã§a peut prendre (beaucoup) de temps</p>
    <button class="btn-oui" onclick="chargerPlusInfo()">Oui</button>
    <p>Il est possible d'afficher Ã  l'aide des loupes Ã  cotÃ© de chaque nom de carte</p>
    `;
    dnsResultatDiv.appendChild(infoText);

    dnsResultatDiv.appendChild(ipElement);
    dnsResultatDiv.appendChild(versionElement);
    dnsResultatDiv.appendChild(document.createElement('br'));
    //********************************
    data.slice(1).forEach(function (equipement) 
    {
        var separator = document.createElement('hr');
        separator.classList.add('separator');
        dnsResultatDiv.appendChild(separator);
        var typeCarte = equipement['Type de carte'];
        var slot = equipement['Slot'];

        var equipementInfo = document.createElement('div');
        equipementInfo.classList.add('equipement-info');

        var typeCarteElement = document.createElement('p');
        typeCarteElement.textContent = 'Type de carte : ' + typeCarte;
        typeCarteElement.classList.add('type-carte-label');

        var buttonElement = document.createElement('button');
        buttonElement.classList.add('btn-magnifying-glass');
        buttonElement.onclick = function()
        {
            searchEquipement(typeCarte, slot, chassis);
        };
        var iconElement = document.createElement('i');
        iconElement.classList.add('fas', 'fa-magnifying-glass');
        buttonElement.appendChild(iconElement);
        typeCarteElement.appendChild(buttonElement);

        equipementInfo.appendChild(typeCarteElement);

        var slotElement = document.createElement('p');
        slotElement.textContent = 'Slot : ' + slot;
        equipementInfo.appendChild(slotElement);

        dnsResultatDiv.appendChild(equipementInfo);
    });

    dnsContainer.style.display = 'block';
}

function afficherInfoTexte(infoText)
{
    var infoTextElement = document.querySelector('.info-text');
    infoTextElement.style.display = 'block';

    // Ã‰vÃ©nement pour garder le bloc d'information affichÃ© si survolÃ©
    infoTextElement.addEventListener('mouseenter', function()
    {
        infoTextElement.style.display = 'block';
    });

    // Ã‰vÃ©nement pour masquer le bloc d'information lorsque non survolÃ©
    infoTextElement.addEventListener('mouseleave', function() 
    {
        infoTextElement.style.display = 'none';
    });
}


//***************************************************************************************************************
function afficherDetailsEMUX(data) 
{
    var dnsContainer = document.getElementById('dns-container');
    var emuxResultatDiv = document.getElementById('emux-container');
    var dnsResultatDiv = document.getElementById('dns-resultat');
    dnsResultatDiv.innerHTML = ''; // Clear previous results
    emuxResultatDiv.innerHTML = '';

    var dns = data[0]['DNS'];
    var ip = data[0]['Adresse IP'];
    var version = data[0]['Version'];

    var dnsElement = document.createElement('p');
    dnsElement.textContent = 'DNS : ' + dns;
    var ipElement = document.createElement('p');
    ipElement.textContent = 'IP : ' + ip;

    var versionElement = document.createElement('p');
    versionElement.textContent = 'Version : ' + version;
    if (version != undefined && version.match(/6\.4\.802/))
    {
        versionElement.classList.add('version-special');
        var iconElement = document.createElement('i');
        iconElement.classList.add('fas', 'fa-check-circle', 'icon-special');
        versionElement.appendChild(iconElement);
    } 
    else 
    {
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

        //*******IF CARTE EMUX********
        if (typeCarte.includes("EMUX"))
        {
            var lineRXEmux = equipement['Line Rx Avg Power'];
            var lineRXEmuxElement = document.createElement('p');
            lineRXEmuxElement.textContent = 'Line Rx Avg Power : ' + lineRXEmux;
            emuxResultatDiv.appendChild(lineRXEmuxElement);

            var lineTXEmux = equipement['Line Tx Avg Power'];
            var lineTXEmuxElement = document.createElement('p');
            lineTXEmuxElement.textContent = 'Line Tx Avg Power : ' + lineTXEmux;
            emuxResultatDiv.appendChild(lineTXEmuxElement);

            var lineErrorsEmux = equipement['Line Uncorrected FEC Errors'];
            var lineErrorsEmuxElement = document.createElement('p');
            lineErrorsEmuxElement.textContent = 'Line Uncorrected FEC Errors : ' + lineErrorsEmux;
            emuxResultatDiv.appendChild(lineErrorsEmuxElement);

            var lineTempEmux = equipement['Line Temp'];
            var lineTempEmuxElement = document.createElement('p');
            lineTempEmuxElement.textContent = 'Line TempÃ©rature : ' + lineTempEmux;
            emuxResultatDiv.appendChild(lineTempEmuxElement);

            for (var port in equipement)
            {
                if (equipement.hasOwnProperty(port) && port.startsWith('Port '))
                {
                    var portData = equipement[port];
                    
                    var portHeaderElement = document.createElement('p');
                    portHeaderElement.textContent = port + ':';

                    // Ajouter une icÃ´ne de basculement
                    var toggleIcon = document.createElement('i');
                    toggleIcon.classList.add('fas', 'fa-chevron-down', 'toggle-icon');
                    toggleIcon.onclick = toggleContent;
                    portHeaderElement.appendChild(toggleIcon);

                    emuxResultatDiv.appendChild(portHeaderElement);

                    // Contenu cachÃ© par dÃ©faut
                    var portContent = document.createElement('div');
                    portContent.classList.add('hidden-content');
                    emuxResultatDiv.appendChild(portContent);

                    var clientRXEmux = portData['Client Rx Power'];
                    var clientRXEmuxElement = document.createElement('p');
                    clientRXEmuxElement.textContent = 'Client Rx Power : ' + clientRXEmux;
                    portContent.appendChild(clientRXEmuxElement);

                    var clientTXEmux = portData['Client Tx Power'];
                    var clientTXEmuxElement = document.createElement('p');
                    clientTXEmuxElement.textContent = 'Client Tx Power : ' + clientTXEmux;
                    portContent.appendChild(clientTXEmuxElement);

                    var clientTINEmux = portData['Client Traffic In'];
                    var clientTINEmuxElement = document.createElement('p');
                    clientTINEmuxElement.textContent = 'Client Traffic In : ' + clientTINEmux;
                    portContent.appendChild(clientTINEmuxElement);

                    var clientTOUTEmux = portData['Client Traffic Out'];
                    var clientTOUTEmuxElement = document.createElement('p');
                    clientTOUTEmuxElement.textContent = 'Client Traffic Out : ' + clientTOUTEmux;
                    portContent.appendChild(clientTOUTEmuxElement);

                    var clientICRCEmux = portData['Client Input CRC'];
                    var clientICRCEmuxElement = document.createElement('p');
                    clientICRCEmuxElement.textContent = 'Client Input CRC : ' + clientICRCEmux;
                    portContent.appendChild(clientICRCEmuxElement);

                    var clientOCRCEmux = portData['Client Output CRC'];
                    var clientOCRCEmuxElement = document.createElement('p');
                    clientOCRCEmuxElement.textContent = 'Client Output CRC : ' + clientOCRCEmux;
                    portContent.appendChild(clientOCRCEmuxElement);

                    var clientTempEmux = portData['Client Temp'];
                    var clientTempEmuxElement = document.createElement('p');
                    clientTempEmuxElement.textContent = 'Client Temp : ' + clientTempEmux;
                    portContent.appendChild(clientTempEmuxElement);
                }
            }
        }                       

        if (typeCarte.includes("FRS02"))
        {
            var lineTXPM200 = equipement['Line 1 Tx Power'];
            var lineTXPM200Element = document.createElement('p');
            lineTXPM200Element.textContent = 'Line 1 Tx Power : ' + lineTXPM200;
            emuxResultatDiv.appendChild(lineTXPM200Element);

            var lineRXPM200 = equipement['Line 1 Rx Power'];
            var lineTXPM200Element = document.createElement('p');
            lineTXPM200Element.textContent = 'Line 1 Rx Power : ' + lineRXPM200;
            emuxResultatDiv.appendChild(lineTXPM200Element);

            var lineErrorsPM200 = equipement['Line Uncorrected FEC Errors'];
            var lineErrorsPM200Element = document.createElement('p');
            lineErrorsPM200Element.textContent = 'Line Uncorrected FEC Errors : ' + lineErrorsPM200;
            emuxResultatDiv.appendChild(lineErrorsPM200Element);

            var lineTempPM200 = equipement['Line 1 Temp'];
            var lineTempPM200Element = document.createElement('p');
            lineTempPM200Element.textContent = 'Line 1 Temp : ' + lineTempPM200;
            emuxResultatDiv.appendChild(lineTempPM200Element);

            var Client1TempPM200 = equipement['Client Port 1 temperature'];
            var Client1TempPM200Element = document.createElement('p');
            Client1TempPM200Element.textContent = 'Client Port 1 temperature : ' + Client1TempPM200;
            emuxResultatDiv.appendChild(Client1TempPM200Element);

            var Client2TempPM200 = equipement['Client Port 2 temperature'];
            var Client2TempPM200Element = document.createElement('p');
            Client2TempPM200Element.textContent = 'Client Port 2 temperature : ' + Client2TempPM200;
            emuxResultatDiv.appendChild(Client2TempPM200Element);
            
            for (var port in equipement)
            {
                if (equipement.hasOwnProperty(port) && port.startsWith('Port '))
                {
                    var portData = equipement[port];
                    
                    var portHeaderElement = document.createElement('p');
                    portHeaderElement.textContent = port + ':';
                    var toggleIcon = document.createElement('i');
                    toggleIcon.classList.add('fas', 'fa-chevron-down', 'toggle-icon');
                    toggleIcon.onclick = toggleContent;
                    portHeaderElement.appendChild(toggleIcon);

                    emuxResultatDiv.appendChild(portHeaderElement);

                    // Contenu cachÃ© par dÃ©faut
                    var portContent = document.createElement('div');
                    portContent.classList.add('hidden-content');
                    emuxResultatDiv.appendChild(portContent);

                    portHeaderElement.classList.add('port-hover');
                    portHeaderElement.classList.add('port-label');
                    var ClientAvgRxPM200 = portData['Client1/2 avg Rx Power'];
                    var ClientAvgRxPM200Element = document.createElement('p');
                    ClientAvgRxPM200Element.textContent = 'Client1/2 avg Rx Power : ' + ClientAvgRxPM200;
                    portContent.appendChild(ClientAvgRxPM200Element);

                    var ClientAvgTxPM200 = portData['Client1/2 avg Tx Power'];
                    var ClientAvgTxPM200Element = document.createElement('p');
                    ClientAvgTxPM200Element.textContent = 'Client1/2 avg Tx Power : ' + ClientAvgTxPM200;
                    portContent.appendChild(ClientAvgTxPM200Element);

                    var clientICRCPM200 = portData['Client Input CRC'];
                    var clientICRCPM200Element = document.createElement('p');
                    clientICRCPM200Element.textContent = 'Client Input CRC : ' + clientICRCPM200;
                    portContent.appendChild(clientICRCPM200Element);

                    var clientOCRCPM200 = portData['Client Output CRC'];
                    var clientOCRCPM200Element = document.createElement('p');
                    clientOCRCPM200Element.textContent = 'Client Output CRC : ' + clientOCRCPM200;
                    portContent.appendChild(clientOCRCPM200Element);

                    var clientTINPM200 = portData['Client Traffic In'];
                    var clientTINPM200Element = document.createElement('p');
                    clientTINPM200Element.textContent = 'Client Traffic In : ' + clientTINPM200;
                    portContent.appendChild(clientTINPM200Element);

                    var clientTOUTPM200 = portData['Client Traffic Out'];
                    var clientTOUTPM200Element = document.createElement('p');
                    clientTOUTPM200Element.textContent = 'Client Traffic Out : ' + clientTOUTPM200;
                    portContent.appendChild(clientTOUTPM200Element);
                }
            }
        }

        if (typeCarte.includes("C1008MPLH")) {
        //****************************
            for (var port in equipement)
            {
                if (equipement.hasOwnProperty(port) && port.startsWith('Port ')) 
                {
                    var portData = equipement[port];
                    
                    var portHeaderElement = document.createElement('p');
                    portHeaderElement.textContent = port + ':';
                    var toggleIcon = document.createElement('i');
                    toggleIcon.classList.add('fas', 'fa-chevron-down', 'toggle-icon');
                    toggleIcon.onclick = toggleContent;
                    portHeaderElement.appendChild(toggleIcon);

                    emuxResultatDiv.appendChild(portHeaderElement);

                    // Contenu cachÃ© par dÃ©faut
                    var portContent = document.createElement('div');
                    portContent.classList.add('hidden-content');
                    emuxResultatDiv.appendChild(portContent);

                    portHeaderElement.classList.add('port-hover');
                    portHeaderElement.classList.add('port-label');
                    var clientRxC1008MPLH = portData['Client Rx Power'];
                    var clientRxC1008MPLHElement = document.createElement('p');
                    clientRxC1008MPLHElement.textContent = 'Client Rx Power : ' + clientRxC1008MPLH;
                    emuxResultatDiv.appendChild(clientRxC1008MPLHElement);

                    var clientTxC1008MPLH = portData['Client Tx Power'];
                    var clientTxC1008MPLHElement = document.createElement('p');
                    clientTxC1008MPLHElement.textContent = 'Client Tx Power : ' + clientTxC1008MPLH;
                    portContent.appendChild(clientTxC1008MPLHElement);

                    var clientICRCC1008MPLH = portData['Client Input CRC'];
                    var clientICRCC1008MPLHElement = document.createElement('p');
                    clientICRCC1008MPLHElement.textContent = 'Client Input CRC : ' + clientICRCC1008MPLH;
                    portContent.appendChild(clientICRCC1008MPLHElement);

                    var clientIErrorC1008MPLH = portData['Client Input Error'];
                    var clientIErrorC1008MPLHElement = document.createElement('p');
                    clientIErrorC1008MPLHElement.textContent = 'Client Input Error : ' + clientIErrorC1008MPLH;
                    portContent.appendChild(clientRxC1008MPLHElement);

                    var clientOErrorC1008MPLH = portData['Client Output Error'];
                    var clientOErrorC1008MPLHElement = document.createElement('p');
                    clientOErrorC1008MPLHElement.textContent = 'Client Output Error : ' + clientOErrorC1008MPLH;
                    portContent.appendChild(clientOErrorC1008MPLHElement);

                    var clientTempC1008MPLH = portData['Client Temp'];
                    var clientTempC1008MPLHElement = document.createElement('p');
                    clientTempC1008MPLHElement.textContent = 'Client Temp : ' + clientTempC1008MPLH;
                    portContent.appendChild(clientTempC1008MPLHElement);

                    var lineRxC1008MPLH = portData['Line Rx Avg Power'];
                    var lineRxC1008MPLHElement = document.createElement('p');
                    lineRxC1008MPLHElement.textContent = 'Line Rx Avg Power : ' + lineRxC1008MPLH;
                    portContent.appendChild(lineRxC1008MPLHElement);

                    var lineTxC1008MPLH = portData['Line Tx Avg Power'];
                    var lineTxC1008MPLHElement = document.createElement('p');
                    lineTxC1008MPLHElement.textContent = 'Line Tx Avg Power : ' + lineTxC1008MPLH;
                    portContent.appendChild(lineTxC1008MPLHElement);

                    var lineErrorC1008MPLH = portData['Line Error counter'];
                    var lineErrorC1008MPLHElement = document.createElement('p');
                    lineErrorC1008MPLHElement.textContent = 'Line Error counter : ' + lineErrorC1008MPLH;
                    portContent.appendChild(lineErrorC1008MPLHElement);

                    var linetempC1008MPLH = portData['Line Temp'];
                    var linetempC1008MPLHElement = document.createElement('p');
                    linetempC1008MPLHElement.textContent = 'Line Temp : ' + linetempC1008MPLH;
                    portContent.appendChild(linetempC1008MPLHElement);
                }
            }
        }

        if (typeCarte.includes("C1008GE"))
        {
            for (var port in equipement)
            {
                if (equipement.hasOwnProperty(port) && port.startsWith('Port '))
                {
                    var portData = equipement[port];
                    
                    var portHeaderElement = document.createElement('p');
                    portHeaderElement.textContent = port + ':';
                    var toggleIcon = document.createElement('i');
                    toggleIcon.classList.add('fas', 'fa-chevron-down', 'toggle-icon');
                    toggleIcon.onclick = toggleContent;
                    portHeaderElement.appendChild(toggleIcon);

                    emuxResultatDiv.appendChild(portHeaderElement);

                    // Contenu cachÃ© par dÃ©faut
                    var portContent = document.createElement('div');
                    portContent.classList.add('hidden-content');
                    emuxResultatDiv.appendChild(portContent);
            
                    portHeaderElement.classList.add('port-hover');
                    portHeaderElement.classList.add('port-label');
                    var clientRxC1008GE = portData['Client Rx Power'];
                    var clientRxC1008GEElement = document.createElement('p');
                    clientRxC1008GEElement.textContent = 'Client Rx Power : ' + clientRxC1008GE;
                    portContent.appendChild(clientRxC1008GEElement);
            
                    var clientTxC1008GE = portData['Client Tx Power'];
                    var clientTxC1008GEElement = document.createElement('p');
                    clientTxC1008GEElement.textContent = 'Client Tx Power : ' + clientTxC1008GE;
                    portContent.appendChild(clientTxC1008GEElement);
            
                    var clientICRCC1008GE = portData['Client Input CRC'];
                    var clientICRCC1008GEElement = document.createElement('p');
                    clientICRCC1008GEElement.textContent = 'Client Input CRC : ' + clientICRCC1008GE;
                    portContent.appendChild(clientICRCC1008GEElement);
            
                    var clientIErrorC1008GE = portData['Client Input Error'];
                    var clientIErrorC1008GEElement = document.createElement('p');
                    clientIErrorC1008GEElement.textContent = 'Client Input Error : ' + clientIErrorC1008GE;
                    portContent.appendChild(clientIErrorC1008GEElement);      

                    var clientOErrorC1008GE = portData['Client Output Error'];
                    var clientOErrorC1008GEElement = document.createElement('p');
                    clientOErrorC1008GEElement.textContent = 'Client Output Error : ' + clientOErrorC1008GE;
                    portContent.appendChild(clientOErrorC1008GEElement);

                    var clientICRCErrorC1008GE = portData['Client Input CRC Error'];
                    var clientICRCErrorC1008GEElement = document.createElement('p');
                    clientICRCErrorC1008GEElement.textContent = 'Client Input CRC Error : ' + clientICRCErrorC1008GE;
                    portContent.appendChild(clientICRCErrorC1008GEElement    );   
            
                    var clientTempC1008GE = portData['Client Temp'];
                    var clientTempC1008GEElement = document.createElement('p');
                    clientTempC1008GEElement.textContent = 'Client Temp : ' + clientTempC1008GE;
                    portContent.appendChild(clientTempC1008GEElement);
            
                    var lineRxC1008GE = portData['Line Rx Power'];
                    var lineRxC1008GEElement = document.createElement('p');
                    lineRxC1008GEElement.textContent = 'Line Rx Power : ' + lineRxC1008GE;
                    portContent.appendChild(lineRxC1008GEElement);
            
                    var lineTxC1008GE = portData['Line Tx Power'];
                    var lineTxC1008GEElement = document.createElement('p');
                    lineTxC1008GEElement.textContent = 'Line Tx Power : ' + lineTxC1008GE;
                    portContent.appendChild(lineTxC1008GEElement);
                    
                    var lineErrorC1008GE = portData['Line Error counter'];
                    var lineErrorC1008GEElement = document.createElement('p');
                    lineErrorC1008GEElement.textContent = 'Line Error counter : ' + lineErrorC1008GE;
                    portContent.appendChild(lineErrorC1008GEElement);
            
                    var linetempC1008GE = portData['Line Temp'];
                    var linetempC1008GEElement = document.createElement('p');
                    linetempC1008GEElement.textContent = 'Line Temp : ' + linetempC1008GE;
                    portContent.appendChild(linetempC1008GEElement);
                }
            }   
        }

        if (typeCarte.includes("PM_O6006"))
        {
            for (var port in equipement) 
            {
                if (equipement.hasOwnProperty(port) && port.startsWith('Port ')) 
                {
                    var portData = equipement[port];
                    
                    var portHeaderElement = document.createElement('p');
                    portHeaderElement.textContent = port + ':';
                    var toggleIcon = document.createElement('i');
                    toggleIcon.classList.add('fas', 'fa-chevron-down', 'toggle-icon');
                    toggleIcon.onclick = toggleContent;
                    portHeaderElement.appendChild(toggleIcon);

                    emuxResultatDiv.appendChild(portHeaderElement);

                    // Contenu cachÃ© par dÃ©faut
                    var portContent = document.createElement('div');
                    portContent.classList.add('hidden-content');
                    emuxResultatDiv.appendChild(portContent);
                
                    var clientRxPm06006 = portData['Client Rx Power'];
                    var clientRxPm06006Element = document.createElement('p');
                    clientRxPm06006Element.textContent = 'Client Rx Power : ' + clientRxPm06006;
                    portContent.appendChild(clientRxPm06006Element);

                    var clientTxPm06006 = portData['Client Tx Power'];
                    var clientTxPm06006Element = document.createElement('p');
                    clientTxPm06006Element.textContent = 'Client Tx Power : ' + clientTxPm06006;
                    portContent.appendChild(clientTxPm06006Element);

                    var clientTINPm06006 = portData['Client Traffic In'];
                    var clientTINPm06006Element = document.createElement('p');
                    clientTINPm06006Element.textContent = 'Client Traffic In : ' + clientTINPm06006;
                    portContent.appendChild(clientTINPm06006Element);

                    var clientIErrorPm06006 = portData['Client Input Errors'];
                    var clientIErrorPm06006Element = document.createElement('p');
                    clientIErrorPm06006Element.textContent = 'Client Input Errors : ' + clientIErrorPm06006;
                    portContent.appendChild(clientRxPm06006Element);      

                    var clientOErrorPm06006 = portData['Client Output Errors'];
                    var clientOErrorPm06006Element = document.createElement('p');
                    clientOErrorPm06006Element.textContent = 'Client Output Errors : ' + clientOErrorPm06006;
                    portContent.appendChild(clientOErrorPm06006Element);
                
                    var clientTempPm06006 = portData['Client Temp'];
                    var clientTempPm06006Element = document.createElement('p');
                    clientTempPm06006Element.textContent = 'Client Temp : ' + clientTempPm06006;
                    portContent.appendChild(clientTempPm06006Element);

                    var lineRxPm06006 = portData['Line Rx Avg Power'];
                    var lineRxPm06006Element = document.createElement('p');
                    lineRxPm06006Element.textContent = 'Line Rx Avg Power : ' + lineRxPm06006;
                    portContent.appendChild(lineRxPm06006Element);

                    var lineTxPm06006 = portData['Line Tx Avg Power'];
                    var lineTxPm06006Element = document.createElement('p');
                    lineTxPm06006Element.textContent = 'Line Tx Avg Power : ' + lineTxPm06006;
                    portContent.appendChild(lineTxPm06006Element);
                    
                    var lineErrorPm06006 = portData['Line Error counter'];
                    var lineErrorPm06006Element = document.createElement('p');
                    lineErrorPm06006Element.textContent = 'Line Error counter : ' + lineErrorPm06006;
                    portContent.appendChild(lineErrorPm06006Element);

                    var linetempPm06006 = portData['Line Temp'];
                    var linetempPm06006Element = document.createElement('p');
                    linetempPm06006Element.textContent = 'Line Temp : ' + linetempPm06006;
                    portContent.appendChild(linetempPm06006Element);
                }
            }  
        }

        if (typeCarte.includes("OAIL-HCS"))
        {
            for (var port in equipement)
            {
                if (equipement.hasOwnProperty(port) && port.startsWith('Port ')) 
                {
                var portData = equipement[port];
                
                var portHeaderElement = document.createElement('p');
                portHeaderElement.textContent = port + ':';
                var toggleIcon = document.createElement('i');
                toggleIcon.classList.add('fas', 'fa-chevron-down', 'toggle-icon');
                toggleIcon.onclick = toggleContent;
                portHeaderElement.appendChild(toggleIcon);

                emuxResultatDiv.appendChild(portHeaderElement);

                // Contenu cachÃ© par dÃ©faut
                var portContent = document.createElement('div');
                portContent.classList.add('hidden-content');
                emuxResultatDiv.appendChild(portContent);
                
                var IL1RxOAIL = portData['IL1 Rx Power'];
                var IL1RxOAILElement = document.createElement('p');
                IL1RxOAILElement.textContent = 'IL1 Rx Power : ' + IL1RxOAIL;
                portContent.appendChild(IL1RxOAILElement);
        
                var IL1TxOAIL = portData['IL1 Tx Power'];
                var IL1TxOAILElement = document.createElement('p');
                IL1TxOAILElement.textContent = 'IL1 Tx Power : ' + IL1TxOAIL;
                portContent.appendChild(IL1TxOAILElement);
        
                var IL1TINOAIL = portData['IL1 Gain'];
                var IL1TINOAILElement = document.createElement('p');
                IL1TINOAILElement.textContent = 'IL1 Gain : ' + IL1TINOAIL;
                portContent.appendChild(IL1TINOAILElement);
        
                var IL1IErrorOAIL = portData['IL1 pump laser bias'];
                var IL1IErrorOAILElement = document.createElement('p');
                IL1IErrorOAILElement.textContent = 'IL1 pump laser bias : ' + IL1IErrorOAIL;
                portContent.appendChild(IL1RxOAILElement);  
                
                var IL1TempOAIL = portData['module Temp'];
                var IL1TempOAILElement = document.createElement('p');
                IL1TempOAILElement.textContent = 'IL1 Temp : ' + IL1TempOAIL;
                portContent.appendChild(IL1TempOAILElement);
        
                var IL2RxOAIL = portData['IL2 Rx Power'];
                var IL2RxOAILElement = document.createElement('p');
                IL2RxOAILElement.textContent = 'IL2 Rx Power : ' + IL2RxOAIL;
                portContent.appendChild(IL2RxOAILElement);
        
                var IL2TxOAIL = portData['IL2 Tx Power'];
                var IL2TxOAILElement = document.createElement('p');
                IL2TxOAILElement.textContent = 'IL2 Tx Power : ' + IL2TxOAIL;
                portContent.appendChild(IL2TxOAILElement);

                var IL2ErrorOAIL = portData['IL2 Gain'];
                var IL2ErrorOAILElement = document.createElement('p');
                IL2ErrorOAILElement.textContent = 'IL2 Gain : ' + IL2ErrorOAIL;
                portContent.appendChild(IL2ErrorOAILElement);
        
                var IL2tempOAIL = portData['IL2 pump laser bias'];
                var IL2tempOAILElement = document.createElement('p');
                IL2tempOAILElement.textContent = 'IL2 pump laser bias : ' + IL2tempOAIL;
                portContent.appendChild(IL2tempOAILElement);
                }
            }  
        }

        if (typeCarte.includes("1001RR"))
        {
            for (var port in equipement) 
            {
                if (equipement.hasOwnProperty(port) && port.startsWith('Port '))
                {
                    var portData = equipement[port];
                    
                    var portHeaderElement = document.createElement('p');
                    portHeaderElement.textContent = port + ':';
                    var toggleIcon = document.createElement('i');
                    toggleIcon.classList.add('fas', 'fa-chevron-down', 'toggle-icon');
                    toggleIcon.onclick = toggleContent;
                    portHeaderElement.appendChild(toggleIcon);

                    emuxResultatDiv.appendChild(portHeaderElement);

                    // Contenu cachÃ© par dÃ©faut
                    var portContent = document.createElement('div');
                    portContent.classList.add('hidden-content');
                    emuxResultatDiv.appendChild(portContent);
                
                    var clientRx1001RR = portData['Client Rx Power'];
                    var clientRx1001RRElement = document.createElement('p');
                    clientRx1001RRElement.textContent = 'Client Rx Power : ' + clientRx1001RR;
                    portContent.appendChild(clientRx1001RRElement);

                    var clientTx1001RR = portData['Client Tx Power'];
                    var clientTx1001RRElement = document.createElement('p');
                    clientTx1001RRElement.textContent = 'Client Tx Power : ' + clientTx1001RR;
                    portContent.appendChild(clientTx1001RRElement);
                
                    var clientTemp1001RR = portData['Client Temp'];
                    var clientTemp1001RRElement = document.createElement('p');
                    clientTemp1001RRElement.textContent = 'Client Temp : ' + clientTemp1001RR;
                    portContent.appendChild(clientTemp1001RRElement);

                    var lineRx1001RR = portData['Line Rx Power'];
                    var lineRx1001RRElement = document.createElement('p');
                    lineRx1001RRElement.textContent = 'Line Rx Power : ' + lineRx1001RR;
                    portContent.appendChild(lineRx1001RRElement);

                    var lineTx1001RR = portData['Line Tx Power'];
                    var lineTx1001RRElement = document.createElement('p');
                    lineTx1001RRElement.textContent = 'Line Tx Power : ' + lineTx1001RR;
                    portContent.appendChild(lineTx1001RRElement);

                    var linetemp1001RR = portData['Line Temp'];
                    var linetemp1001RRElement = document.createElement('p');
                    linetemp1001RRElement.textContent = 'Line Temp : ' + linetemp1001RR;
                    portContent.appendChild(linetemp1001RRElement);
                }
            }  
        }      

        if (typeCarte.includes("C1001HC"))
        {
            for (var port in equipement)
            {
                if (equipement.hasOwnProperty(port) && port.startsWith('Port '))
                {
                    var portData = equipement[port];
                    
                    var portHeaderElement = document.createElement('p');
                    portHeaderElement.textContent = port + ':';
                    var toggleIcon = document.createElement('i');
                    toggleIcon.classList.add('fas', 'fa-chevron-down', 'toggle-icon');
                    toggleIcon.onclick = toggleContent;
                    portHeaderElement.appendChild(toggleIcon);

                    emuxResultatDiv.appendChild(portHeaderElement);

                    // Contenu cachÃ© par dÃ©faut
                    var portContent = document.createElement('div');
                    portContent.classList.add('hidden-content');
                    emuxResultatDiv.appendChild(portContent);

                    var clientRxC1001HC = portData['Client Rx Power'];
                    var clientRxC1001HCElement = document.createElement('p');
                    clientRxC1001HCElement.textContent = 'Client Rx Power : ' + clientRxC1001HC;
                    portContent.appendChild(clientRxC1001HCElement);

                    var clientTxC1001HC = portData['Client Tx Power'];
                    var clientTxC1001HCElement = document.createElement('p');
                    clientTxC1001HCElement.textContent = 'Client Tx Power : ' + clientTxC1001HC;
                    portContent.appendChild(clientTxC1001HCElement);

                    var clientICRCC1001HC = portData['Client Traffic In'];
                    var clientICRCC1001HCElement = document.createElement('p');
                    clientICRCC1001HCElement.textContent = 'Client Traffic In : ' + clientICRCC1001HC;
                    portContent.appendChild(clientICRCC1001HCElement);

                    var clientIErrorC1001HC = portData['Client Traffic Out'];
                    var clientIErrorC1001HCElement = document.createElement('p');
                    clientIErrorC1001HCElement.textContent = 'Client Traffic Out : ' + clientIErrorC1001HC;
                    portContent.appendChild(clientRxC1001HCElement);      

                    var clientOErrorC1001HC = portData['Client Traffic Input CRC'];
                    var clientOErrorC1001HCElement = document.createElement('p');
                    clientOErrorC1001HCElement.textContent = 'Client Traffic Input CRC : ' + clientOErrorC1001HC;
                    portContent.appendChild(clientOErrorC1001HCElement);

                    var clientICRCErrorC1001HC = portData['Client Traffic Output CRC'];
                    var clientICRCErrorC1001HCElement = document.createElement('p');
                    clientICRCErrorC1001HCElement.textContent = 'Client Traffic Output CRC : ' + clientICRCErrorC1001HC;
                    portContent.appendChild(clientICRCErrorC1001HCElement    );   

                    var clientTempC1001HC = portData['Client Temp'];
                    var clientTempC1001HCElement = document.createElement('p');
                    clientTempC1001HCElement.textContent = 'Client Temp : ' + clientTempC1001HC;
                    portContent.appendChild(clientTempC1001HCElement);

                    var lineRxC1001HC = portData['Line Rx Power'];
                    var lineRxC1001HCElement = document.createElement('p');
                    lineRxC1001HCElement.textContent = 'Line Rx Power : ' + lineRxC1001HC;
                    portContent.appendChild(lineRxC1001HCElement);

                    var lineTxC1001HC = portData['Line Tx Power'];
                    var lineTxC1001HCElement = document.createElement('p');
                    lineTxC1001HCElement.textContent = 'Line Tx Power : ' + lineTxC1001HC;
                    portContent.appendChild(lineTxC1001HCElement);
                    
                    var lineErrorC1001HC = portData['Line Input Errors'];
                    var lineErrorC1001HCElement = document.createElement('p');
                    lineErrorC1001HCElement.textContent = 'Line Input Errors : ' + lineErrorC1001HC;
                    portContent.appendChild(lineErrorC1001HCElement);

                    var linetempC1001HC = portData['Line Temp'];
                    var linetempC1001HCElement = document.createElement('p');
                    linetempC1001HCElement.textContent = 'Line Temp : ' + linetempC1001HC;
                    portContent.appendChild(linetempC1001HCElement);
                }
            }   
        }

        if (typeCarte.includes("PM404"))
        {
            for (var port in equipement)
            {
                if (equipement.hasOwnProperty(port) && port.startsWith('Port '))
                {
                    var portData = equipement[port];
                    
                    var portHeaderElement = document.createElement('p');
                    portHeaderElement.textContent = port + ':';
                    var toggleIcon = document.createElement('i');
                    toggleIcon.classList.add('fas', 'fa-chevron-down', 'toggle-icon');
                    toggleIcon.onclick = toggleContent;
                    portHeaderElement.appendChild(toggleIcon);

                    emuxResultatDiv.appendChild(portHeaderElement);

                    // Contenu cachÃ© par dÃ©faut
                    var portContent = document.createElement('div');
                    portContent.classList.add('hidden-content');
                    emuxResultatDiv.appendChild(portContent);
                
                    var clientRxPM404 = portData['Client Rx Power'];
                    var clientRxPM404Element = document.createElement('p');
                    clientRxPM404Element.textContent = 'Client Rx Power : ' + clientRxPM404;
                    portContent.appendChild(clientRxPM404Element);

                    var clientTxPM404 = portData['Client Tx Power'];
                    var clientTxPM404Element = document.createElement('p');
                    clientTxPM404Element.textContent = 'Client Tx Power : ' + clientTxPM404;
                    portContent.appendChild(clientTxPM404Element);
                
                    var clientTempPM404 = portData['Client Temp'];
                    var clientTempPM404Element = document.createElement('p');
                    clientTempPM404Element.textContent = 'Client Temp : ' + clientTempPM404;
                    portContent.appendChild(clientTempPM404Element);

                    var lineRxPM404 = portData['Line Rx Power'];
                    var lineRxPM404Element = document.createElement('p');
                    lineRxPM404Element.textContent = 'Line Rx Power : ' + lineRxPM404;
                    portContent.appendChild(lineRxPM404Element);

                    var lineTxPM404 = portData['Line Tx Power'];
                    var lineTxPM404Element = document.createElement('p');
                    lineTxPM404Element.textContent = 'Line Tx Power : ' + lineTxPM404;
                    portContent.appendChild(lineTxPM404Element);

                    var linetempPM404 = portData['Line Temp'];
                    var linetempPM404Element = document.createElement('p');
                    linetempPM404Element.textContent = 'Line Temp : ' + linetempPM404;
                    portContent.appendChild(linetempPM404Element);
                }
            }
        }

        if (typeCarte.includes("PMOAB-E") || typeCarte.includes("PMOABP-E") || typeCarte.includes("PMOABPLC-12/23"))
        {
            for (var port in equipement)
            {
                if (equipement.hasOwnProperty(port) && port.startsWith('Port '))
                {
                var portData = equipement[port];
                
                var portHeaderElement = document.createElement('p');
                portHeaderElement.textContent = port + ':';
                var toggleIcon = document.createElement('i');
                toggleIcon.classList.add('fas', 'fa-chevron-down', 'toggle-icon');
                toggleIcon.onclick = toggleContent;
                portHeaderElement.appendChild(toggleIcon);

                emuxResultatDiv.appendChild(portHeaderElement);

                // Contenu cachÃ© par dÃ©faut
                var portContent = document.createElement('div');
                portContent.classList.add('hidden-content');
                emuxResultatDiv.appendChild(portContent);

                var boosterRxOAb = portData['Booster Rx Power'];
                var boosterRxOAbElement = document.createElement('p');
                boosterRxOAbElement.textContent = 'Booster Rx Power : ' + boosterRxOAb;
                portContent.appendChild(boosterRxOAbElement);

                var boosterTxOAb = portData['Booster Tx Power'];
                var boosterTxOAbElement = document.createElement('p');
                boosterTxOAbElement.textContent = 'Booster Tx Power : ' + boosterTxOAb;
                portContent.appendChild(boosterTxOAbElement);

                var boosterGainOAb = portData['Booster Gain'];
                var boosterGainOAbElement = document.createElement('p');
                boosterGainOAbElement.textContent = 'Booster Gain : ' + boosterGainOAb;
                portContent.appendChild(boosterGainOAbElement);

                var boosterPLBOAb = portData['Booster pump laser bias'];
                var boosterPLBOAbElement = document.createElement('p');
                boosterPLBOAbElement.textContent = 'Booster pump laser bias : ' + boosterPLBOAb;
                portContent.appendChild(boosterPLBOAbElement);      

                var preampRXOAb = portData['Pre-Amp Rx Power'];
                var preampRXOAbElement = document.createElement('p');
                preampRXOAbElement.textContent = 'Pre-Amp Rx Power : ' + preampRXOAb;
                portContent.appendChild(preampRXOAbElement);

                var preampTXOAb = portData['Pre-Amp Tx Power'];
                var preampTXOAbElement = document.createElement('p');
                preampTXOAbElement.textContent = 'Pre-Amp Tx Power : ' + preampTXOAb;
                portContent.appendChild(preampTXOAbElement    );   

                var preampGainOAb = portData['Pre-Amp Gain'];
                var preampGainOAbElement = document.createElement('p');
                preampGainOAbElement.textContent = 'Pre-Amp Gain : ' + preampGainOAb;
                portContent.appendChild(preampGainOAbElement);

                var preampRxOAb = portData['Pre-Amp pump laser bias'];
                var preampRxOAbElement = document.createElement('p');
                preampRxOAbElement.textContent = 'Pre-Amp pump laser bias : ' + preampRxOAb;
                portContent.appendChild(preampRxOAbElement);

                var tempOAb = portData['module Temp'];
                var tempOAbElement = document.createElement('p');
                tempOAbElement.textContent = 'module Temp : ' + tempOAb;
                portContent.appendChild(tempOAbElement);
                }
            } 
        }

        if (typeCarte.includes("ROADM"))
        {
            for (var port in equipement)
            {
                if (equipement.hasOwnProperty(port) && port.startsWith('Port '))
                {
                    var portData = equipement[port];
                    
                    var portHeaderElement = document.createElement('p');
                    portHeaderElement.textContent = port + ':';
                    var toggleIcon = document.createElement('i');
                    toggleIcon.classList.add('fas', 'fa-chevron-down', 'toggle-icon');
                    toggleIcon.onclick = toggleContent;
                    portHeaderElement.appendChild(toggleIcon);

                    emuxResultatDiv.appendChild(portHeaderElement);

                    // Contenu cachÃ© par dÃ©faut
                    var portContent = document.createElement('div');
                    portContent.classList.add('hidden-content');
                    emuxResultatDiv.appendChild(portContent);

                    var channelnumber = portData['Channel number'];
                    var channelnumberElement = document.createElement('p');
                    channelnumberElement.textContent = 'Channel number : ' + channelnumber;
                    portContent.appendChild(channelnumberElement);

                    var channelPI = portData['Channel power In'];
                    var channelPIElement = document.createElement('p');
                    channelPIElement.textContent = 'Channel power In : ' + channelPI;
                    portContent.appendChild(channelPIElement    );   

                    var channelPO = portData['Channel power Out'];
                    var channelPOElement = document.createElement('p');
                    channelPOElement.textContent = 'Channel power Out : ' + channelPO;
                    portContent.appendChild(channelPOElement);
                }
            }  
        }

        if (typeCarte.includes("OTDR")) 
        {
            for (var port in equipement)
            {
                if (equipement.hasOwnProperty(port) && port.startsWith('Port '))
                {
                    var portData = equipement[port];
                    
                    var portHeaderElement = document.createElement('p');
                    portHeaderElement.textContent = port + ':';
                    var toggleIcon = document.createElement('i');
                    toggleIcon.classList.add('fas', 'fa-chevron-down', 'toggle-icon');
                    toggleIcon.onclick = toggleContent;
                    portHeaderElement.appendChild(toggleIcon);

                    emuxResultatDiv.appendChild(portHeaderElement);

                    // Contenu cachÃ© par dÃ©faut
                    var portContent = document.createElement('div');
                    portContent.classList.add('hidden-content');
                    emuxResultatDiv.appendChild(portContent);

                    var tempOTDR = portData['Temp'];
                    var tempOTDRElement = document.createElement('p');
                    tempOTDRElement.textContent = 'Temp : ' + tempOTDR;
                    portContent.appendChild(tempOTDRElement);

                    var RXOTDR = portData['RX Power'];
                    var RXOTDRElement = document.createElement('p');
                    RXOTDRElement.textContent = 'RX Power : ' + RXOTDR;
                    portContent.appendChild(RXOTDRElement);

                    var TXOTDR = portData['TX Power'];
                    var TXOTDRElement = document.createElement('p');
                    TXOTDRElement.textContent = 'TX Power : ' + TXOTDR;
                    portContent.appendChild(TXOTDRElement    );   

                    var faultPO = portData['OTDR Fault Distance'];
                    var faultPOElement = document.createElement('p');
                    faultPOElement.textContent = 'OTDR Fault Distance : ' + faultPO;
                    portContent.appendChild(faultPOElement);
                }
            } 
        }

        if (typeCarte.includes("OABP-HCS"))
        {
            for (var port in equipement)
            {
                if (equipement.hasOwnProperty(port) && port.startsWith('Port '))
                {
                    var portData = equipement[port];
                    
                    var portHeaderElement = document.createElement('p');
                    portHeaderElement.textContent = port + ':';

                    // Ajouter une icÃ´ne de basculement
                    var toggleIcon = document.createElement('i');
                    toggleIcon.classList.add('fas', 'fa-chevron-down', 'toggle-icon');
                    toggleIcon.onclick = toggleContent;
                    portHeaderElement.appendChild(toggleIcon);

                    emuxResultatDiv.appendChild(portHeaderElement);

                    // Contenu cachÃ© par dÃ©faut
                    var portContent = document.createElement('div');
                    portContent.classList.add('hidden-content');
                    emuxResultatDiv.appendChild(portContent);
                        
                
                    var tempOABP = portData['Temperature'];
                    var tempOABPElement = document.createElement('p');
                    tempOABPElement.textContent = 'Temperature : ' + tempOABP;
                    portContent.appendChild(tempOABPElement);

                    var boosterRxOABP = portData['Booster Rx Power'];
                    var boosterRxOABPElement = document.createElement('p');
                    boosterRxOABPElement.textContent = 'Booster Rx Power : ' + boosterRxOABP;
                    portContent.appendChild(boosterRxOABPElement);

                    var boosterTxOABP = portData['Booster Tx Power'];
                    var boosterTxOABPElement = document.createElement('p');
                    boosterTxOABPElement.textContent = 'Booster Tx Power : ' + boosterTxOABP;
                    portContent.appendChild(boosterTxOABPElement);

                    var boosterGainOABP = portData['Booster Gain'];
                    var boosterGainOABPElement = document.createElement('p');
                    boosterGainOABPElement.textContent = 'Booster Gain : ' + boosterGainOABP;
                    portContent.appendChild(boosterGainOABPElement);

                    var boosterPLBOABP = portData['Booster pump laser bias'];
                    var boosterPLBOABPElement = document.createElement('p');
                    boosterPLBOABPElement.textContent = 'Booster pump laser bias : ' + boosterPLBOABP;
                    portContent.appendChild(boosterPLBOABPElement);      

                    var preampRXOABP = portData['Pre-Amp Rx'];
                    var preampRXOABPElement = document.createElement('p');
                    preampRXOABPElement.textContent = 'Pre-Amp Rx : ' + preampRXOABP;
                    portContent.appendChild(preampRXOABPElement);

                    var preampTXOABP = portData['Pre-Amp Tx'];
                    var preampTXOABPElement = document.createElement('p');
                    preampTXOABPElement.textContent = 'Pre-Amp Tx : ' + preampTXOABP;
                    portContent.appendChild(preampTXOABPElement);

                    var preampGainOABP = portData['Pre-Amp Gain'];
                    var preampGainOABPElement = document.createElement('p');
                    preampGainOABPElement.textContent = 'Pre-Amp Gain : ' + preampGainOABP;
                    portContent.appendChild(preampGainOABPElement);

                    var preampRxOABP = portData['Pre-Amp pump laser bias'];
                    var preampRxOABPElement = document.createElement('p');
                    preampRxOABPElement.textContent = 'Pre-Amp pump laser bias : ' + preampRxOABP;
                    portContent.appendChild(preampRxOABPElement);
                }
            } 
        }
    });  

    dnsContainer.style.display = 'block';
}

function afficherServiceWDM(data)
{
    console.log('afficherServiceWDM()');

    var dnsContainer = document.getElementById('dns-container');
    dnsContainer.innerHTML = '';

    var content = '<table class="table_service_wdm">';

    data.forEach(item =>
    {
        console.log(item);

        if (item['ip'].match(/time\=/))
        {
            content += '<tr><td class="table_service_wdm_th">' + item['equipment name'] + '</td><td style="text-align:center;font-weight:700;color:white;padding:12px;border-radius:50px;background-color:#5cb85c;">OK</td></tr><tr><td colspan="2"><pre>PING : ' + item['ip'] + '</pre></td></tr>';
        }
        else
        {
            content += '<tr><td class="table_service_wdm_th">' + item['equipment name'] + '</td><td style="text-align:center;font-weight:700;color:white;padding:12px;border-radius:50px;background-color:red;">KO</td></tr><tr><td colspan="2"><pre>PING : ' + item['ip'] + '</pre></td></tr>';
        }
    });

    dnsContainer.innerHTML = content + '</table>';
    dnsContainer.style.display = 'block';

    console.log('fin afficherServiceWDM()');
}

function afficherInfoDNS(dns)
{
    console.log('Information DNS pour :', dns);
}

function searchEquipement(idService, typeCarte, slot)
{
    console.log('Recherche d\'Ã©quipement pour :', idService, typeCarte, slot);
}

function toggleContent(event)
{
    var content = event.target.parentElement.nextElementSibling;
    if (content.classList.contains('hidden-content'))
    {
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
function showLoadingIcon()
{
    $('.btn-verification').html('<div id="loading-icon"><i class="fas fa-spinner fa-spin"></i></div>').attr('disabled', true);
}

function hideLoadingIcon()
{
    $('.btn-verification').html('<b>VÃ©rification</b>').attr('disabled', false);
}
function resetContainers()
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