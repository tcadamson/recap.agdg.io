var queues = {};
var registry = {};

function format(temp) {
    var f = {
        y: temp.y.toString().slice(-2),
        m: temp.m + 1 < 10 ? "0" + (temp.m + 1) : temp.m + 1,
        w: temp.w
    }
    f.ym = f.y + f.m;
    return f;
}

function load(deferred, month, f) {
    var label = $("<div>").attr({class: "label", id: f.ym + "a"});
    var box = $("<div>").attr({class: "boxed border", id: f.ym + "b"});
    for (var i = 1; i <= f.w; i++) {
        var a = $("<a>").addClass("dead").html("?").appendTo(box);
        var defer = $.Deferred();
        queues[f.y][f.m].push(defer);
        queues[f.y].net.push(defer);
        $.getJSON("res/recap/" + f.ym + i + "/data.json").done(function() {
            if (!(f.m in registry[f.y])) {
                label.html($("<p>").html(month));
                registry[f.y][f.m] = {label: label, box: box};
            }
        }).always(defer.resolve);
        if (i != f.w) a.addClass("spaced");
    }
    buildMonth(deferred, f);
}

function buildMonth(deferred, f) {
    deferred(queues[f.y][f.m], function() {
        for (var i = 0; i < arguments.length; i++) {
            if (!$.isFunction(arguments[i].promise)) {
                var link = "http://recap.agdg.io/view?id=" + f.ym + (i + 1);
                var a = registry[f.y][f.m].box.find("> a:eq(" + i + ")");
                a.attr({href: link, target: "_blank"}).removeClass("dead").html(i + 1);
            }
        }
    });
}

function buildYear(deferred, fixed, anchor) {
    var year = fixed.attr("id");
    deferred(queues[year].net, function() {
        var keys = Object.keys(registry[year]).sort()
        for (var i = 0; i < keys.length; i++) {
            var month = keys[i];
            var objects = registry[year][month];
            if (!keys[i + 1]) {
                objects.label.addClass("end");
                objects.box.addClass("end");
            }
            objects.label.appendTo(fixed);
            objects.label.after(objects.box);
        }
        if (fixed.data("last")) fixed.addClass("end");
        anchor.after(fixed);
    });
}

define(function(require) {
    var $ = require("jquery");
    var moment = require("moment");
    var deferred = require("module/deferred");
    var origin = moment("20170102");
    var copy = moment(origin);
    var temp = {
        y: copy.year(),
        m: copy.month(),
        w: 0
    };
    var f = format(temp);
    var threshold = 4;
    var breaks = $(".break");
    breaks.each(function(index) {
        var fixed = $("<div>").attr({class: "fixed", id: f.y});
        if (index + 1 == breaks.length) fixed.data("last", true);
        registry[f.y] = {};
        queues[f.y] = {net: []};
        for (var i = 0; i <= copy.weeksInYear(); i++) {
            copy.add(moment.weekdays().length, "days");
            temp.w++;
            if (copy.month() != temp.m && copy.date() > threshold) {
                temp.y = copy.year();
                temp.m = copy.month();
                temp.w = 1;
                queues[f.y][f.m] = [];
                load(deferred, moment.months(copy.month() - 1), f);
            }
            f = format(temp);
        }
        buildYear(deferred, fixed, $(this));
    });
});