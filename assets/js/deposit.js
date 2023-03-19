var pricesList = {};

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

    //  weapon type
    itemInfo.skinWeapon = item.querySelector("footer > div:nth-child(1) > div:nth-child(1)").innerHTML.trim()
    itemName += itemInfo.skinWeapon;

    // skin name
    if (item.querySelector("footer > div:nth-child(1) > div:nth-child(2)")) {
        let skin = item.querySelector("footer > div:nth-child(1) > div:nth-child(2) > div").innerHTML.trim()

        itemInfo.skinName = skin
        itemName += " | " + skin;
    }

    // skin exterior for selectable
    if (item.querySelector('cw-item > div:nth-child(2) > div:nth-child(2) > cw-item-variant-details')) {
        let exterior = item.querySelector('cw-item > div:nth-child(2) > div:nth-child(2) > cw-item-variant-details > div > div').innerHTML.trim()

        itemInfo.skinExterior = exterior
        itemName += " (" + exterior + ")";
    }

    // skin exterior for non-selectable
    if (item.querySelector('cw-item > div:nth-child(1) > div:nth-child(2) > cw-item-variant-details')) {
        let exterior = item.querySelector('cw-item > div:nth-child(1) > div:nth-child(2) > cw-item-variant-details > div > div').innerHTML.trim()

        itemInfo.skinExterior = exterior
        itemName += " (" + exterior + ")";
    }

    let priceInfo = pricesList[itemName];
    if (priceInfo === undefined) return;

    let rollPrice = item.querySelector('footer > div:nth-child(2) > div > cw-pretty-balance > span').innerText
    if (rollPrice < 100) {
        var tbuffVal = priceInfo.buff163.starting_at.price / 0.62
    }
    else{
        var tbuffVal = priceInfo.buff163.starting_at.price / 0.66
    }


    let buffVal = Math.floor(tbuffVal * 100) / 100

    let calc =  Math.floor(rollPrice/buffVal*100) - 100
    let parent_el = item.querySelector("footer");

    let res = checkPrice(rollPrice, buffVal)
    parent_el.appendChild(drawCustomForm(res, calc));
}

// Check price, good pricing can differentiate +-3% buff price
// Items under 100coins are wrongly priced for now
function checkPrice(rollPrice, buffPrice){
    let suggestedPrice = buffPrice;
    let x = rollPrice / suggestedPrice;

    if (x > 1.03) return "Overpriced";
    if (x <= 1.03 && x >= 0.97) return "Goodpriced";
    if (x < 0.97) return "Underpriced";
}