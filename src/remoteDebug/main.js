define(["chrome/main", "chrome/debug"], function(extension, debug){
    function skip(message) {
        return message.method == 'Runtime.evaluate' &&
            message.params.expression == "window.open('', '_self').close();"
    }

    return {

        currentPage: null,
        port: null,


        init: function() {

            chrome.extension.onConnectExternal.addListener(dojo.hitch(this, "onConnect"));


            extension.on("connect", function(page) {
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
                this.sendToBrackets("event", method, params);
            }.bind(this));
        },

        onConnect: function(port) {
            if (!port.name == "RDPBridgeServer")
                return;

            this.port = port;

            console.log("Brackets connection established");
            port.onMessage.addListener(function(message){
                if(this.currentPage && message.method) {
                    if(!skip(message))
                        this.currentPage.sendDebugCommand(message.id, message.method, message.params);
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

                console.log("Sending result to Brackets (" + result.method + ")", result);

                this.port.postMessage({data:resultMessage});
            } else {
                console.error("Tried to send a message to Brackets, however the port wasn't open");
            }
        }
    }
})