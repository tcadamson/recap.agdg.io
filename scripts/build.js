var framew = 416;
var frameh = 234;
var detailh = 100;
var block = 2;
var recap;
var month;
var w;
var yy;
var yymm;
var id;

$(document).ready(function()
{
    recap = getParameter("id");
    if (!recap)
        home();
    month = months[parseInt(recap.substr(block, block)) - 1];
    w = recap.charAt(block*2);
    yy = recap.substr(0, block);
    yymm = recap.substr(0, block*2);
    jsonLoad("res/recaps/" + recap + "/data.json", function(data)
    {
        attachHeader();
        build(data);
        correctImages();
        $("p").linkify({
            target: "_blank",
            className: "na"
        });
        $(".quotelink").each(function(i, obj) {
            obj.href = "https://4chan.org" + obj.href.replace("http://recap.agdg.io", "");
            obj.target = "_blank";
        });
    });
});

function getParameter(name)
{
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)");
    var results = regex.exec(window.location.href);
    if (!results)
        return null;
    if (!results[2])
        return "";
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function attachHeader()
{
    document.head.appendChild(newElement("link", { rel: "stylesheet", href: "res/css/" + yymm + ".css" }));
    document.head.appendChild(newElement("title", {}, recap.substr(block, block) + "/20" + yy + ", week " + w));
}

function loadItemContents(entry, parts)
{
    var details = newElement("div", { class: "details" });
    var progress = newElement("div", { class: "list" });
    var list = "PROGRESS";
    parts.heading.appendChild(newElement("h2", {}, entry.game));
    details.appendChild(newElement("p", {}, "DEV&emsp;" + entry.name + "<br>TOOLS&emsp;" + entry.tools + "<br>WEB&ensp;&nbsp; " + entry.web));
    parts.contents.appendChild(details);
    for (var i = 0; i < entry.progress.length; i++)
    {
        list += "<br>" + entry.progress[i];
    }
    progress.appendChild(newElement("p", {}, list));
    parts.contents.appendChild(progress);
    parts.score.appendChild(newElement("h2", {}, entry.scoring));
}

function testWildcard(id, entry, parts)
{
    if (entry.wildcard)
    {
        parts.item.classList.add(entry.wildcard);
        var icon = newElement("div", { class: "icon" });
        var img = new Image();
        img.id = id;
        img.src = "res/icons/" + yymm + "/" + entry.wildcard + ".png";
        img.onload = function()
        {
            var container = getNode(document.getElementById(this.id).childNodes, "div", "icon");
            container.appendChild(this);
        }
        parts.item.appendChild(icon);
    }
}

function build(jsonData)
{
    var header = newElement("div", { class: "header" });
    var text = newElement("div", { class: "text" });
    var grid = newElement("div", { class: "grid" });
    header.appendChild(newElement("img", { src: "res/icons/" + yymm + ".png", alt: "JLMG" }));
    text.appendChild(newElement("h1", {}, month.toUpperCase() + " 20" + yy));
    text.appendChild(newElement("h1", { id: "week" }, "WEEK " + w));
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
        testWildcard(id, entry, parts);
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
    var canvas = getNode(document.getElementById(img.id).childNodes, "canvas");
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
        img.src = "res/recaps/" + recap + "/images/" + id + canvas.getAttribute("ext");
        img.onload = function()
        {
            resize(this);
        }
    }
}