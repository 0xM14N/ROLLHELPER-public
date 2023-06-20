
webhook = 'INSERT-YOUR-PRIVATE-WEBHOOK-HERE'
depoAutoAccept = false
withdrawNotify = false

const itemInfo = {};
var pricesList = {};

var sendWebHookDiscord = (urlDiscordWebhook = webhook, webhookType, scrapedData = {} ,embeds = []) => {
    const url = urlDiscordWebhook
    const templateWebhook = {
        "areYouReady": {
            "username": `DEPOSIT`,
            "avatar_url": 'https://pbs.twimg.com/profile_images/1610084878720049154/n0j4nld9_400x400.png',
            "content": ``,
            "embeds": [
                {
                    "title": `Ready to deliver!`,
                    "description": `Send the item!
                    @TAG`,
                    "color": 0,
                    "fields": [
                        {
                            "name": "ITEM: ",
                            "value": scrapedData.weapon
                        }
                    ]
                }
            ]
        },
        "IncommingTrade": {
            "username": `WITHDRAW`,
            "avatar_url": 'https://pbs.twimg.com/profile_images/1610084878720049154/n0j4nld9_400x400.png',
            "content": ``,
            "embeds": [
                {
                    "title": `Item Withdrawn!`,
                    "description": `Accept the item!
                    @TAG`,
                    "color": 0,
                    "fields": [
                        {
                            "name": "ITEM: ",
                            "value": scrapedData.weapon
                        }
                    ],
                    "image": {
                        "url": ''
                    }
                }
            ]
        }
    }
    params = templateWebhook[webhookType]

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': "application/json",
        },
        body: JSON.stringify(params)
    })
}

const createButtonCancelDepo = () => {
    const button = document.createElement('button')
    button.classList.add("cancelDepoButton")
    button.style.fontFamily = "Flama,Roboto,Helvetica Neue,sans-serif;"
    button.style.color = "#000000"
    button.style.background = "#e0cf4c"
    button.style.margin = "10px"
    button.style.padding = "0 10px"
    button.style.lineHeight = "35px"
    button.style.fontWeight = "bold"
    button.style.border = "solid #21252b 3px"
    button.style.borderRadius = "20px"
    const buttonText = document.createTextNode('DE-LIST')
    button.appendChild(buttonText)

    return button
}

const createButtonCounter = () => {
    const button = document.createElement('button')
    button.classList.add("counterCoinButton")
    button.style.fontFamily = "Flama,Roboto,Helvetica Neue,sans-serif;"
    button.style.color = "#000000"
    button.style.background = "#e0cf4c"
    button.style.margin = "10px"
    button.style.padding = "0 10px"
    button.style.lineHeight = "35px"
    button.style.fontWeight = "bold"
    button.style.border = "solid #21252b 3px"
    button.style.borderRadius = "20px"
    const buttonText = document.createTextNode('COINS')
    button.appendChild(buttonText)

    return button
}

// CREATE BUTTONS
const cancelDepoButton = createButtonCancelDepo()
const coinCounterButton = createButtonCounter()

// PLACE BUTTONS INTO THE MAIN HEADER
const intFindPlaceForButtons = setInterval(async function() {
    const mainHeader = document.querySelector("body > cw-root > cw-header > nav > div:nth-child(2)")

    if (mainHeader) {
        clearInterval(intFindPlaceForButtons)
        mainHeader.appendChild(cancelDepoButton)
        mainHeader.appendChild(coinCounterButton)
    }
}, 50)


// ADD EVENT LISTENERS FOR BUTTONS
const intAddEventListeners = setInterval(async function(){

    let cancelBtn = document.getElementsByClassName('cancelDepoButton')[0]
    let coinsBtn =  document.getElementsByClassName('counterCoinButton')[0]

    if (cancelBtn && coinsBtn){
        clearInterval(intAddEventListeners)
        cancelBtn.addEventListener("click",function(){
            // de-list script
            cancelNodes = [];
            try {
                var nodes = document.getElementsByClassName("mat-button-wrapper")
                // find the nodes with text 'cancel'
                for (i = 0; i < nodes.length; i++) {
                    if (nodes[i].innerText === 'CANCEL') {
                        cancelNodes.push(nodes[i])
                    }
                }
                for (i = 0; i < cancelNodes.length; i++) {
                    cancelNodes[i].click()
                };
            } catch (e) {
                //err
            }
        } );
        coinCounterButton.addEventListener('click', function () {
                try{
                    var inv = document.querySelector("cw-steam-inventory-search-grid > form > div.ml-3 > cw-pretty-balance > span").textContent
                    var balance = document.querySelector("cw-pretty-balance > span").textContent

                    var inv_value = parseFloat(inv.replace(',', ''))
                    var bal_value = parseFloat(balance.replace(',', ''))
                    var total = Math.round(inv_value + bal_value)

                    document.getElementsByClassName('counterCoinButton')[0].innerHTML = total

                    var btnValue = document.getElementsByClassName('counterCoinButton')[0].innerHTML

                    navigator.clipboard.writeText(btnValue)
                } catch (e){
                    //err
                }
                var btnValue =document.getElementsByClassName('counterCoinButton')[0].innerHTML
                // Copy the value
                navigator.clipboard.writeText(btnValue)
            }
        );
    }
},50);

intLookForPopup = setInterval(function(){
    let tempTradeInfo = itemInfo.weapon

    // DEPOSIT AUTO-ACCEPT + DC NOTIFICATION
    if (popup = document.querySelector("body > div.cdk-overlay-container")){
        if (depoReadyBtn = popup.querySelector("cw-deposit-joined-dialog button")){
            if(depoAutoAccept){
                depoReadyBtn.click()

                const intLookForScrape = setInterval(function(){
                    if(weaponName = document.querySelector("cw-deposit-processing-dialog > mat-dialog-content > cw-item")){
                        clearInterval(intLookForScrape)

                        itemInfo.weapon =  weaponName.innerText
                        if (typeof tempTradeInfo == "undefined") sendWebHookDiscord(webhook,webhookType = 'areYouReady', itemInfo);
                        if (tempTradeInfo !== itemInfo.weapon) sendWebHookDiscord(webhook,webhookType = 'areYouReady', itemInfo);
                    }
                })
            }
        }

        // WITHDRAW DC NOTIFICATION
        if (offersBtn = document.querySelector("cw-withdraw-processing-dialog > mat-dialog-actions > a > span.mat-button-wrapper > span")){
            if (withdrawNotify){

                let tradeInfo = document.querySelector("cw-withdraw-processing-dialog > mat-dialog-content > cw-item")
                itemInfo.weapon = tradeInfo.innerText

                if (typeof tempTradeInfo == "undefined") sendWebHookDiscord(webhook,swebhookType = 'IncommingTrade', itemInfo)
                if (tempTradeInfo !== itemInfo.weapon) sendWebHookDiscord(webhook,swebhookType = 'IncommingTrade', itemInfo)
            }
        }
    }
},1000);
