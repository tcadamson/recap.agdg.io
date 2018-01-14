function stableSort(array, key = "score") {
    var temp = array.slice();
    return array.sort(function(a, b) {
        var result = (a[key] == b[key] ? 0 : (a[key] > b[key] ? -1 : 1));
        return result === 0 ? temp.indexOf(a) - temp.indexOf(b) : result;
    });
}

define(function(require) {
    var $ = require("jquery");
    var deferred = require("module/deferred");
    var edges = [1000, 500, 200, 1];
    var list = [];
    var requests = [
        $.getJSON("res/stats.json"),
        $.getJSON("res/scores.json")
    ];
    deferred(requests, function(stats, scores) {
        $.each(scores, function(k, v) {
            if (v.streak > 1 && v.inactive == 0) k = k + " [x" + v.mult + ", " + v.streak + " streak]";
            list.push({str: k, score: parseInt(v.score)});
        });
        stableSort(list);
        var entry = 0;
        var tier = 0;
        $(".break").each(function(index) {
            var ul = $("<ul>").attr("class", "bounded");
            $(this).after(ul);
            while(entry < stats.games && list[entry].score >= edges[tier]) {
                ul.append($("<li>").html(list[entry].score + "&emsp;" + list[entry].str));
                entry++;
            }
            if (index + 1 == edges.length) ul.addClass("end");
            tier++;
        });
    });
});