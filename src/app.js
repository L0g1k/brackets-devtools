define(["remoteDebug/main", "chrome/main", "chrome/debug"],
    function (remoteDebug, extension, debug) {
    return {
        init: function() {
            extension.init();
            remoteDebug.init();
            debug.init();
            extension.on("connect", function(page) {
                console.debug("Page " + page.tabURL + " has connected (tabId:" + page.tabId + ")");
            });
            extension.on("disconnect", function(page) {
                console.debug("Page has disconnected");
            });
            this.broadcastId();
        },

        broadcastId: function() {
            chrome.management.getAll(function(apps){
                var quickfire = apps.filter(function(app){
                    return isQuickfire(app);
                });
                if(quickfire) {
                    sendId();
                } else {
                    chrome.management.onInstalled.addListener(function(app){
                        if(isQuickfire(app)) {
                            sendId();
                        }
                    })
                }
            });

            function isQuickfire(app) {
                return app.name == "Quickfire";
            }

            function sendId() {
                console.debug('Sending extension id');
                var ws = new WebSocket("ws://127.0.0.1:9876");
                ws.onopen = function () {
                    ws.send(JSON.stringify({
                        extensionId: chrome.extension.getBackgroundPage().location.host
                    }));
                };
                ws.onmessage = function(event) {
                    var msg = JSON.parse(event.data);
                    if(msg['extensionIdSet']) {
                        console.debug('Extension id set');
                    }
                }
            }
        }
    };
});;