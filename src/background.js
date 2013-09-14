require.config({
    paths: {
        underscore: "../lib/underscore"
    }
})

require(["app"] , function (app) {
    _.mixin({hitch: function (scope, method) {
        scope = scope || window;
        if (!scope[method]) {
            throw(['_.hitch: scope["', method, '"] is null (scope="', scope, '")'].join(''));
        }
        return function () {
            return scope[method].apply(scope, arguments || []);
        };
    }});
    // Sometimes I just type dojo.hitch out of muscle memory... so I just make it exist instead of confusing my
    // brain when I switch projects. Sorry it's strange!
    window.dojo = {
        hitch : _.hitch
    }

    // Syntactic sugar for micro event api.. again mimicing dojo. You can just say myObject.on('event', args)
    // instead of $(myObject).triggerHandler('event', args)
    Object.prototype.emit = function() {
        var event = Array.prototype.shift.apply(arguments);
        $.fn.triggerHandler.call($(this), event, arguments);
        return this;
    }

    Object.prototype.on = function(event, handler) {
        $(this).on(event, function(){
            Array.prototype.shift.apply(arguments)
            handler.apply(handler, arguments);
        });
    }

    Array.prototype.remove = function (needle) {
        var i = 0;
        while (this[i] !== needle && i < this.length - 1) ++i;
        if (this[i] === needle) {
            this.splice(i, 1);
        }
        else {
            throw new Error(needle + " not found in array " + this);
        }
    };

    return app.init();
});
