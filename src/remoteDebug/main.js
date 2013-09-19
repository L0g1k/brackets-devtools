define(["chrome/main", "chrome/debug"], function(extension, debug){
    function skip(message) {
        return message.method == 'Runtime.evaluate' &&
            message.params.expression == "window.open('', '_self').close();"
    }

    function transformMessageIfNeeded(message) {
        // We have a different workflow than Brackets. It's easier to change it by responding differently
        // than it is to change it by changing Brackets live dev source.
        if(message.method == 'Runtime.evaluate' && message.params.expression) {
            if(message.params.expression == 'window.isBracketsLiveDevelopmentInterstitialPageLoaded') {
                console.log("Force returning true for Brackets interstitial check");
                message.params.expression = "1==1";
            }
        }
    }

    return {

        currentPage: null,
        port: null,
        ignoreLog: false,

        init: function() {

            chrome.extension.onConnectExternal.addListener(dojo.hitch(this, "onConnect"));


            extension.on("connect", function(page) {

                if(this.currentPage && (page.tabId == this.currentPage.tabId))
                    return;

                this.currentPage = page;
                page.on("attach", function(){
                    console.debug("Debugger attached");
                });
                page.on("detach", function(){
                    console.debug("Debugger detached");
                });
                page.on("debugResult", function(id, result){
                    this.sendToBrackets('result', id, result);
                }.bind(this));
                page.attachDebugger();

            }.bind(this));

            /*extension.on("message", function(message){
                if(this.currentPage && message.method) {
                    this.currentPage.sendDebugCommand(message.method, message.params);
                }
            })*/;

            debug.on("event", function(debuggee, method, params){
                console.debug("Event fired:\t" + method);
                this.sendEventToBrackets( method, params);
            }.bind(this));
        },

        onConnect: function(port) {
            if (!port.name == "RDPBridgeServer")
                return;

            this.port = port;

            console.log("Brackets connection established");
            port.onMessage.addListener(function(message){

                var currentPage = this.currentPage;

                if(currentPage && message.method) {
                    if(!skip(message)) {
                        transformMessageIfNeeded(message);
                        currentPage.sendDebugCommand(message.id, message.method, message.params);
                    }
                    else
                        console.log("Skipping window.open() call")
                }
            }.bind(this));

            port.onDisconnect.addListener(function(){
                this.port = undefined;
                console.log("Brackets connection lost")
            }.bind(this));
        },

        sendToBrackets: function(type, id, result) {
            if(!result)
                return;
            if(this.port) {
                var resultMessage = JSON.stringify({
                    messageKey: type,
                    result: result,
                    id: id
                });

                this.port.postMessage({data:resultMessage});
            } else {
                console.error("Tried to send a message to Brackets, however the port wasn't open");
            }
        },

        sendEventToBrackets: function(method, params) {
            if(this.port) {
                var resultMessage = JSON.stringify({
                    messageKey: 'quickfire.event',
                    method: method,
                    params: params
                });
                if(!this.ignoreLog)
                    console.log("Sending event to Brackets (" + method + ")", resultMessage);
                this.port.postMessage({data:resultMessage});
            } else {
                console.error("Tried to send an event to Brackets, however the port wasn't open", message);
            }
        }
    }
})