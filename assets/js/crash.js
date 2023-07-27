const lookForbanner = setInterval(function(){
    const banner = document.getElementsByTagName('cw-game-in-maintenance')[0]
        if (banner){
            banner.remove();
            clearInterval(lookForbanner);
        }
},50);
