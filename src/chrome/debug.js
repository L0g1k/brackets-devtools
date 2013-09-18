/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, forin: true, maxerr: 50, regexp: true */
/*global dojo, chrome, _, define, Extension, $, WebSocket, FileError, window, XMLHttpRequest */


define(["model/Page"], function (Page) {
    return {
        pages: [],
        init: function () {
            // Housekeeping for the debuggers
            chrome.debugger.onDetach.addListener(function(debugee, reason) {
                _.find(this.pages, function(page){
                    return page.tabId == debugee.tabId;
                }).emit("detach", reason);
            }.bind(this));

            chrome.debugger.onEvent.addListener(function(debuggee, method,params) {
                this.emit("event", debuggee, method, params);
            }.bind(this));
        },

        attach: function(page, success) {
            chrome.debugger.attach(
                {tabId: page.tabId},
                "1.0",
                function() {
                    this.pages.push(page);
                    success();
                }.bind(this)
            );
            page.emit("attach");
            page.on("close", _.partial(this.pages.remove, page));
        },

        sendCommand: function(page, id, method, params) {
            chrome.debugger.sendCommand({tabId: page.tabId}, method, params, function(result){
                console.debug("Result of " + method, result);
                page.emit("debugResult", id, result);
            });
        }
    }
});