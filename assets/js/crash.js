const banner = document.querySelector("body > cw-root > mat-sidenav-container > " +
    "mat-sidenav-content > div > cw-crash > cw-game-in-maintenance");

const lookForbanner = setInterval(function(){
        if (banner){
            clearInterval(look4banner);
            banner.remove();
        }
},50);
