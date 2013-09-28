/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, forin: true, maxerr: 50, regexp: true */
/*global dojo, chrome, _, define, Extension, $, WebSocket, FileError, window, XMLHttpRequest */


define(["model/Page"], function (Page) {
    return {

        ports: [],

        init: function () {
            chrome.extension.onConnect.addListener(dojo.hitch(this, "onConnect"));
        },

        onConnect: function (port) {

            if (!port.name == "brackets-devtools")
                return;

            var tabId = port.sender.tab ? port.sender.tab.id : -1;
            var tabURL = port.sender.url;

            var page = new Page({
                tabId: tabId,
                tabURL: tabURL
            });

            this.emit("connect", page);

            port.onDisconnect.addListener(function (port) {
                this.emit("disconnect", page);
            }.bind(this));

            port.onMessage.addListener(function (message) {
                this.emit("message", message);
            }.bind(this));
        },

        echo: function () {
            $(this).triggerHandler("connect");
        }
    }
});