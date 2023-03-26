let excludedItemsFrom62 = ['Knife','Daggers','Gloves','Wraps','Doppler','CS:GO'];
var pricesList = {};

let blue = '\x1b[36m%s\x1b[0m';
let yellow = '\x1b[33m%s\x1b[0m';

function log(c,str){
    console.log(c,str)
}

// send msg for price provider response
function getPriceProvider() {
    chrome.runtime.sendMessage({ type: 'priceProvider' }, response => {
        pricesList = response;
    });
}

addForm();

async function addForm() {
    await getPriceProvider();
    const intervalFindHeader = setInterval(function () {
        const depo = document.querySelector("body > cw-root > mat-sidenav-container > mat-sidenav-content > div > cw-player-to-player-deposit > cw-steam-inventory-search-grid > form")

        if (depo) {
            clearInterval(intervalFindHeader)
            startMutation();
        }
    }, 50)
}

function startMutation() {
    const intLookForGrid = setInterval(function () {

        if (document.querySelector("body > cw-root > mat-sidenav-container > mat-sidenav-content > div > cw-player-to-player-deposit > cw-steam-inventory-search-grid > div.ng-star-inserted")) {
            clearInterval(intLookForGrid);
            const itemsGrid = document.querySelector("body > cw-root > mat-sidenav-container > mat-sidenav-content > div > cw-player-to-player-deposit > cw-steam-inventory-search-grid > div.ng-star-inserted").children;

            // make all skins selectable
            for (let item of itemsGrid) {
                item.classList.add('selectable')
            }
            // set price for each item
            for (let item of itemsGrid) {
                setBuffValue(item);
            }
        }
    }, 50)
}

function drawCustomForm(calcRes, calc) {

    const grandForm = document.createElement("div");
    const searchItem = document.createElement("div");

    grandForm.classList.add("custom-search-grid");
    searchItem.classList.add("custom-search-grid-items");
    grandForm.appendChild(searchItem);

    var n = document.createElement("div");
    n.classList.add("prices-details-info");

    var a = document.createElement("div");
    a.classList.add("square-info");
    a.classList.add("orange-square");

    var r = document.createElement("div");
    r.classList.add("price-detail-info");
    r.appendChild(a);
    r.style.color = "#cd0a0a";
    r.innerHTML += "🚨 +" + calc + " %";

    var o = document.createElement("div");
    o.classList.add("price-detail-info");

    var i = document.createElement("div");
    i.classList.add("square-info");
    i.classList.add("green-square");

     o.appendChild(i);
     o.style.color = '#00C74D';
     o.innerHTML += "✔ " + calc + " %";

    var c = document.createElement("div");
    c.classList.add("price-detail-info");

    var s = document.createElement("div");
    s.classList.add("square-info");
    s.classList.add("red-square");

    c.appendChild(s);
    c.style.color = "#0078D7";
    c.innerHTML += "🔵 " + calc + " %";

    if (calcRes == 'Overpriced')  n.appendChild(r);
    if (calcRes == 'Underpriced') n.appendChild(c);
    if (calcRes == 'Goodpriced')  n.appendChild(o);

    grandForm.appendChild(n);
    return grandForm;
}


function setBuffValue(item) {
    var itemInfo = {};
    let itemName = '';
    let is062  = false;
    let is064 = false;
    let is065 = false;
    let is066 = false;


    //  weapon type
    itemInfo.skinWeapon = item.querySelector("footer > div:nth-child(1) > div:nth-child(1)").innerHTML.trim()
    itemName += itemInfo.skinWeapon;

    // skin name
    if (item.querySelector("footer > div:nth-child(1) > div:nth-child(2)")) {
        let skin = item.querySelector("footer > div:nth-child(1) > div:nth-child(2) > div").innerHTML.trim()
        let nameArr = skin.split(' ')
        let f = nameArr[0]
        let s = nameArr[1]

        // if doppler has a phase
        if (f == 'Doppler'){
            itemInfo.skinName = 'Doppler'
            itemName += " | " + 'Doppler'
            var phase = s + ' ' + nameArr[2]
        }

        // if doppler is a gem
        else if ((nameArr.length === 1) && (f == 'Ruby' || f == 'Sapphire')){
            itemInfo.skinName = f
            itemName += " | " + 'Doppler'
            if (s == 'Pearl') phase = skin
            else var phase = f
        }

        // if doppler is a gamma doppler
        else if (f == 'Gamma' && s == 'Doppler'){
            itemInfo.skinName = f + ' ' + s
            itemName += " | " + 'Gamma Doppler'
            var phase = nameArr[2] + ' ' + nameArr[3]
        }
        // if gamma doppler is a gem -> emerald
        else if ((nameArr.length === 1) && f == 'Emerald'){
            itemInfo.skinName = f
            itemName += " | " + 'Gamma Doppler'
            var phase = 'Emerald'
        }

        //if item is case / pin -> not every item is added yet
        else if (itemInfo.skinWeapon.includes('Case') ||
                 itemInfo.skinWeapon.includes('Pin')){
            // continue
        }

        else{
            itemInfo.skinName = skin
            itemName += " | " + skin
        }
    }

    // skin exterior (for selectable)
    if (item.querySelector('cw-item > div:nth-child(2) > div:nth-child(2) > cw-item-variant-details')) {
        let exterior = item.querySelector('cw-item > div:nth-child(2) > div:nth-child(2) > ' +
            'cw-item-variant-details > div > div').innerHTML.trim()

        itemInfo.skinExterior = exterior
        itemName += " (" + exterior + ")";
    }

    // skin exterior (for non-selectable)
    if (item.querySelector('cw-item > div:nth-child(1) > div:nth-child(2) > cw-item-variant-details')) {
        let exterior = item.querySelector('cw-item > div:nth-child(1) > div:nth-child(2) > ' +
            'cw-item-variant-details > div > div').innerHTML.trim()

        itemInfo.skinExterior = exterior
        itemName += " (" + exterior + ")";
    }

    // ======================== PRICING ========================
    // USED TO CALCULATE PRICE => BUFF163 STARTING_AT VALUE (usd)
    // this value is not the best indicator of the correct price
    // so some pricings might be highly inaccurate

    // ========================== API ==========================
    // prices.csgotrader.app/latest/prices_v6.json
    // https://csgotrader.app/prices/


    let priceInfo = pricesList[itemName];

    // if the constructed name of skin was not found in the JSON price file go to next item
    if (priceInfo === undefined) return;

    let rollPrice = item.querySelector('footer > div:nth-child(2) > div >' +
        ' cw-pretty-balance > span').innerText.replace(',','')

    // Find if item is priced by 0.62 by excluded keywords - bad approach
    // playskins for weapon finishes bellow 200c usually belong in this category
    // keywords arr is at the top of the this file
    if((rollPrice < 200) &&
        (!excludedItemsFrom62.some((v) => itemName.includes(v)) &&
        !excludedItemsFrom62.some((v) => itemName.includes(v)))){
            is062 = true
            var buff = priceInfo.buff163.starting_at.price
            var tbuffVal = priceInfo.buff163.starting_at.price / 0.62
    }

    // if the item is Doppler => Price with 0.64
    else if (itemName.includes('Doppler')){
        is064 = true
        var buff = priceInfo.buff163.starting_at.doppler
        var tbuffVal = buff[phase] / 0.64
    }

    // if the item is Tiger Tooth => Price with 0.65 --> there is
    // much more items for 0.65 not added yet
    else if (itemName.includes('Tiger Tooth')){
        is065 = true
        var buff = priceInfo.buff163.starting_at.price
        var tbuffVal = buff / 0.65
    }

    // else just price with default => 0.66
    else{
        is066 = true;
        var buff = priceInfo.buff163.starting_at.price
        var tbuffVal = buff / 0.66
    }

    let buffVal = Math.floor(tbuffVal * 100) / 100
    let calc =  Math.floor(rollPrice/buffVal*100) - 100

    let parent_el = item.querySelector("footer");
    let res = checkPrice(rollPrice, buffVal)

    parent_el.appendChild(drawCustomForm(res, calc));

    // logs of the item pricings into console
    log(blue,`${itemName}`)
    log(yellow,`\t ROLL PRICE: ${rollPrice} coins`)
    log(yellow,`\t BUFF PRICE: ${buff}$`)
    log(yellow,`\t SUGGESTED : ${buffVal} coins`)

    if(res === 'Overpriced' ) log(yellow,`\t DIFF: ${calc} %`)
    if(res === 'Goodpriced' ) log(yellow,`\t DIFF: ${calc} %`)
    if(res === 'Underpriced') log(yellow,`\t DIFF: ${calc} %`)

    if(is062) log(yellow,`\t USED RATIO: 0.62`)
    if(is064) log(yellow,`\t USED RATIO: 0.64`)
    if(is065) log(yellow,`\t USED RATIO: 0.65`)
    if(is066) log(yellow,`\t USED RATIO: 0.66`)
}

// eval wheter the item is OP/UNDERP/GOOD priced
// diff +-3% is considered as good priced
// over or under that it's overpriced / underpriced
function checkPrice(rollPrice, buffPrice){
    let val = rollPrice / buffPrice;

    if (val > 1.03) return "Overpriced";
    if (val <= 1.03 && val >= 0.97) return "Goodpriced";
    if (val < 0.97) return "Underpriced";
}