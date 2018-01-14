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

function loadMonth(deferred, month, f) {
    var label = $("<div>").attr({class: "label", id: f.ym + "a"});
    var box = $("<div>").attr({class: "boxed border", id: f.ym + "b"});
    for (var i = 1; i <= f.w; i++) {
        var a = $("<a>").addClass("dead").html("?").appendTo(box);
        var defer = $.Deferred();
        queues[f.m].push(defer);
        queues[f.y].push(defer);
        $.getJSON("res/recap/" + f.ym + i + "/data.json").done(function() {
            if (!(f.ym + "b" in registry)) {
                label.html($("<p>").html(month));
                registry[f.ym] = {label: label, box: box};
            }
        }).always(defer.resolve);
        if (i != f.w) a.addClass("spaced");
    }
    deferred(queues[f.m], function() {
        for (var i = 0; i < arguments.length; i++) {
            if (!$.isFunction(arguments[i].promise)) {
                var link = "http://recap.agdg.io/view?id=" + f.ym + (i + 1);
                box.find("> a:eq(" + i + ")").attr({href: link, target: "_blank"}).removeClass("dead").html(i + 1);
            }
        }
    });
}

function build(deferred, year, last) {
    deferred(queues[year], function() {
        var keys = Object.keys(registry).sort()
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            var objects = registry[key];
            objects.label.appendTo($("#" + key.slice(0, -2)));
            objects.label.after(objects.box);
        }
        var fixed = $("#" + year);
        if (!last) fixed.removeClass("end");
        fixed.children(".label").last().addClass("end");
        fixed.children(".boxed.border").last().addClass("end");
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
        var fixed = $("<div>").attr({class: "fixed end", id: f.y});
        queues[f.y] = [];
        for (var i = 0; i <= copy.weeksInYear(); i++) {
            copy.add(moment.weekdays().length, "days");
            temp.w++;
            if (copy.month() != temp.m) {
                if (copy.date() > threshold) {
                    if (copy.year() != temp.y) temp.y = copy.year();
                    temp.m = copy.month();
                    temp.w = 1;
                    queues[f.m] = [];
                    loadMonth(deferred, moment.months(copy.month() - 1), f);
                }
            }
            f = format(temp);
        }
        $(this).after(fixed);
        build(deferred, fixed.attr("id"), index == breaks.length - 1);
    });
});