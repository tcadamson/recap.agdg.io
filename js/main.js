require.config({
    baseUrl: "js",
    paths: {
        jquery: "https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min",
        moment: "https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.20.1/moment.min"
    }
});

define(function(require) {
    var $ = require("jquery");
    var start = "module/" + $("script[data-main][data-start]").attr("data-start");
    if (start) require([start]);
})