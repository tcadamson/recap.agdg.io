define(function(require) {
    var $ = require("jquery");
    var str = $("#stats p").html();
    $.getJSON("res/stats.json").done(function(stats) {
        for (var k in stats) {
            str = str.replace("...", stats[k]);
        }
        $("#stats p").html(str);
    });
});