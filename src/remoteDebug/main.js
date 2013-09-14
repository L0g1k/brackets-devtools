define(["chrome/main"], function(chrome){
    return {

        init: function() {
            chrome.on("connect", function(page) {
                page.on("attach", function(){
                    console.debug("Debugger attached");
                });
                page.on("detach", function(){
                    console.debug("Debugger detached");
                });
                page.attachDebugger();
            });
        }
    }
})