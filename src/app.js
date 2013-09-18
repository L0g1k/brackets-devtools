define(["remoteDebug/main", "chrome/main", "chrome/debug"] ,
    function (remoteDebug, extension, debug) {
    return {
        init: function() {
            extension.init();
            remoteDebug.init();
            debug.init();
            extension.on("connect", function(page) {
                console.debug("Page has connected");
            });
            extension.on("disconnect", function(page) {
                console.debug("Page has disconnected");
            });
        }
    };
});