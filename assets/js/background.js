chrome.runtime.onMessage.addListener((msg, sender, sendResponse) =>
{
    if (msg.type === "priceProvider")
    {
        const json_url = 'https://prices.csgotrader.app/latest/prices_v6.json';
        fetch(json_url)
            .then(response => response.json()
                .then(t => sendResponse(t)))
        return true;
    }
});