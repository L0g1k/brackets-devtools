define(["underscore", "remoteDebug/main", "chrome/main", "chrome/debug"] ,
    function (_, remoteDebug, debug, chrome) {
    return {
        init: function() {
            chrome.init();
            remoteDebug.init();
            debug.init();
            chrome.on("connect", function(page) {
                console.debug("Page has connected");
            });
            chrome.on("disconnect", function(page) {
                console.debug("Page has disconnected");
            });
        }
    };
});