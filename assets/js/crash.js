// removes the maintanance banner from crash to check prices
// Need to press F5 on the crash page
const look4banner = setInterval(function(){
    if (banner = document.querySelector("body > cw-root > mat-sidenav-container > " +
        "mat-sidenav-content > div > cw-crash > cw-game-in-maintenance")){
        clearInterval(look4banner);
        banner.remove();
    }
},50)