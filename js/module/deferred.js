define(["jquery"], function($) {
    return function(requests, done, fail) {
        $.when.apply($, requests).done(function() {
            var loaded = [];
            for (var i = 0; i < arguments.length; i++) {
                loaded.push(arguments[i][0]);
            }
            done.apply(this, loaded);
        }).fail(fail);
    }
});