let btn = document.getElementById('saveSettings');
let switchDepo = document.getElementById('depoSwitch');
let switchNotify = document.getElementById('notifySwitch');
let inputEl = document.getElementById('webhookInput');

document.addEventListener('DOMContentLoaded', function () {
    restoreOptions();
});

btn.addEventListener('click', function(){
    let webhook_value = inputEl.value;

    if (webhook_value != ''){
        chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
            var activeTab = tabs[0];
            chrome.tabs.sendMessage(activeTab.id, {webhook: webhook_value});
        });
    }
    chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
        var activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, {update: true});
    });
})

switchDepo.addEventListener('change', function(){
    if(this.checked){
        chrome.storage.sync.set({
            switchDepoState: true
        });
        chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
            var activeTab = tabs[0];
            chrome.tabs.sendMessage(activeTab.id, {switchDepoState: true});
        });

    } else{
        chrome.storage.sync.set({
            switchDepoState: false
        });
        chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
            var activeTab = tabs[0];
            chrome.tabs.sendMessage(activeTab.id, {switchDepoState: false});
        });
    }
});

switchNotify.addEventListener('change', function(){
    if(this.checked){
        chrome.storage.sync.set({
            switchNotifyState: true
        });
    } else{
        chrome.storage.sync.set({
            switchNotifyState: false
        });
    }
})

function restoreOptions(){
    chrome.storage.sync.get(["switchDepoState"]).then((res) => {
        switchDepo.checked = res.switchDepoState;
    });

    chrome.storage.sync.get(["switchNotifyState"]).then((res) => {
        switchNotify.checked = res.switchNotifyState;
    });

    chrome.storage.sync.get(["switchNotifyState"]).then((res) => {
        switchNotify.checked = res.switchNotifyState;
    });

    chrome.storage.sync.get(["webhook"]).then((res) => {
        if(res.webhook != ''){
            inputEl.placeholder = res.webhook
        }
    });
}
