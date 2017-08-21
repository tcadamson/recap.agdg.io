var framew = 416;
var frameh = 234;
var detailh = 100;
var block = 2;
var recap;
var week;
var month;
var year;
var id;

$(document).ready(function()
{
    recap = getParameter("id");
    if (recap == null || recap == "") home();
    week = recap.charAt(block*2);
    month = months[parseInt(recap.substr(block, block)) - 1];
    year = recap.substr(0, block);
    attachCSS();
    jsonLoad("res/recaps/" + recap + "/data.json", function(data)
    {
        build(data);
        correctImages();
        $("p").linkify({
            target: "_blank",
            className: "na"
        });
    });
});

function getParameter(name)
{
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)");
    var results = regex.exec(window.location.href);
    if (!results) return null;
    if (!results[2]) return "";
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function attachCSS()
{
    var css = document.createElement("link");
    css.setAttribute("rel", "stylesheet");
    css.setAttribute("href", "res/css/" + recap.substr(0, block*2) + ".css");
    document.head.appendChild(css);
}

function loadItemContents(entry, parts)
{
    parts.heading.appendChild(newElement("h2", {}, entry.game));
    parts.contents.appendChild(newElement("p", { id: "details" }, "DEV&emsp;" + entry.name + "<br>TOOLS&emsp;" + entry.tools + "<br>WEB&ensp;&nbsp; " + entry.web));
    var list = "PROGRESS";
    for (var i = 0; i < entry.progress.length; i++)
    {
        list += "<br>" + entry.progress[i];
    }
    parts.contents.appendChild(newElement("p", { id: "progress" }, list));
    parts.score.appendChild(newElement("h2", {}, entry.scoring));
}

function build(jsonData)
{
    var header = newElement("div", { class: "header" });
    var text = newElement("div", { class: "text" });
    var grid = newElement("div", { class: "grid" });
    header.appendChild(newElement("img", { src: "res/agdg" + recap.substr(0, block*2) + ".png", alt: "JLMG" }));
    text.appendChild(newElement("h1", {}, month.toUpperCase() + " 20" + year));
    text.appendChild(newElement("h1", { id: "week" }, "WEEK " + week));
    header.appendChild(text);
    for (var id in jsonData)
    {
        var entry = jsonData[id];
        var canvas = newElement("canvas", { ext: entry.ext, width: framew, height: frameh });
        var part_names = ["item", "frame", "heading", "contents"];
        var parts = {};
        for (var i = 0; i < part_names.length; i++)
        {
            var obj = newElement("div", { class: part_names[i] });
            parts[part_names[i]] = obj;
        }
        part_names.push("score");
        parts.item.id = id;
        parts.score = newElement("div", { class: "heading", id: "score" });
        loadItemContents(entry, parts);
        for (var i = 1; i < part_names.length - 1; i++)
        {
            parts.frame.appendChild(parts[part_names[i + 1]]);
        }
        parts.item.appendChild(canvas);
        parts.item.appendChild(parts.frame);
        grid.appendChild(parts.item);
    }
    document.body.appendChild(header);
    document.body.appendChild(grid);
}

function resize(img)
{
    var canvas = document.getElementById(img.id).childNodes[0];
    var context = canvas.getContext("2d");
    var w = img.width;
    var h = img.height;
    var hscaled = h*(framew/w);
    var valign = -(hscaled - frameh)/2;
    var xshift = 0;
    var yshift = 0;
    var scale = 1;
    if (hscaled < frameh)
    {
        scale = 1/(hscaled/frameh);
        var excess = scale - 1;
        xshift = -(framew*excess)/2;
        yshift = -(hscaled*excess)/2;
    }
    context.drawImage(img, 0, 0, w, h, xshift, valign + yshift, framew*scale, hscaled*scale);
}

function correctImages(canvas)
{
    var canvases = document.getElementsByTagName("canvas");
    for (var i = 0; i < canvases.length; i++)
    {
        var canvas = canvases[i];
        var img = new Image();
        var id = canvas.parentNode.id;
        img.id = id;
        img.onload = function()
        {
            resize(this);
        }
        img.src = "res/recaps/" + recap + "/images/" + id + canvas.getAttribute("ext");
    }
}