var long = { "august": true, "november": true };
var months = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];

function redirect(URL)
{
	window.location = URL;
}

function home()
{
	redirect("http://recap.agdg.io");
}

function newElement(tag, attributes, content)
{
    var obj = document.createElement(tag);
    for (id in attributes)
    {
        var val = attributes[id];
        obj.setAttribute(id, val);
    }
    obj.innerHTML = content || "";
    return obj;
}

function urlExists(URL, args, callback)
{
    $.ajax({
    	url: URL,
        dataType: "text",
        type: "GET",
        complete: function(xhr)
        {
        	callback.apply(this, [xhr.status, args]);
        }
    });
}

function pad(num)
{
    return (num < 10) ? ("0" + num) : String(num);
}

function dateData(month)
{
    var date = new Date();
    var year = String(date.getFullYear()).substring(2);
    var month = pad(month + 1 || date.getMonth() + 1);
    return { id: year + month, month: months[date.getMonth()] };
}

function monthLinks(data, nested)
{
    var list = newElement("div", { class: "list" });
    var weeks = long[data.month] ? 5 : 4;
    for (var i = 1; i <= weeks; i++)
    {
        var link = newElement("div", { class: "link" });
        var h2 = newElement("h2", {}, "...");
        var URL = "res/recaps/" + data.id + i + "/data.json";
        links.push({ l: link, URL: "http://recap.agdg.io/view?id=" + data.id + i });
        urlExists(URL, { id: i }, function(status, args)
        {
            if (status == 200)
            {
                var index = args.id - 1;
                var link = links[index].l;
                var URL = links[index].URL;
                var a = newElement("a", { href: URL, class: "na" }, "<h2>" + args.id + "</h2>");
                link.removeChild(link.childNodes[0]);
                link.setAttribute("class", "link underline");
                link.appendChild(a);
            }
        });
        link.appendChild(h2);
        list.appendChild(link);
    }
    if (nested)
    {
        var lparent = newElement("div", { class: "list" });
        lparent.appendChild(newElement("div", { class: "month" }, "<h2>" + data.month + "</h2>"));
        lparent.appendChild(list);
        return lparent;
    }
    return list;
}