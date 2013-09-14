/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, forin: true, maxerr: 50, regexp: true */
/*global chrome, _, define, Extension, $, WebSocket, FileError, window, XMLHttpRequest */


define(["chrome/debug"], function (debug) {

    function Page(args) {
        $.extend(this, args);
    };

    Page.prototype = {

        tabId: null,
        tabURL: null,
        debuggerAttached: null,



        attachDebugger: function() {
            debug.attach(
                this,
                _.hitch(this, "onAttach")
            );
            this.on("detach", _.hitch(this, "onDetach"))
        },

        onAttach: function() {
            this.debuggerAttached = true;
        },

        onDetach: function() {
            this.debuggerAttached = false;
        }
    }

    return Page;
});