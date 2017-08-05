var enter = 13;
var links = [];
var weeks = { "july": 4, "august": 5 };
var months = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];

$(document).ready(function()
{
    buildLinks();
    $("#field").on("keyup", function(e)
	{
	    if (e.keyCode == enter)
	    {
	        var field = document.getElementById("field");
	        var URL = "res/recaps/" + field.value + "/data.json";
	        urlExists(URL, {}, function(status)
	    	{
	    		switch(status)
	    		{
	    			case 404:
	    				home();
	    				break;
	    			case 200:
	    				redirect("http://recap.agdg.io/view?id=" + field.value);
	    				break;
	    		}
	    	});
	    }
	});
});

function pad(num)
{
	return (num < 10) ? ("0" + num) : String(num);
}

function dateData()
{
	var date = new Date();
	var year = String(date.getFullYear()).substring(2);
	var month = pad(date.getMonth() + 1);
	return { month: months[date.getMonth()], id: year + month };
}

function buildLinks()
{
	var date = dateData();
	var lower = document.getElementById("lower");
	var cq = newElement("div", { class: "content quick" });
	var list = newElement("div", { class: "list" });
    cq.appendChild(newElement("h2", { id: "month"}, date.month));
    for (var i = 1; i <= weeks[date.month]; i++)
    {
    	var link = newElement("div", { class: "link", id: "dead" });
    	var h2 = newElement("h2", {}, "...");
    	var URL = "res/recaps/" + date.id + i + "/data.json";
    	links.push({ l: link, URL: "http://recap.agdg.io/view?id=" + date.id + i });
    	urlExists(URL, { id: i }, function(status, args)
    	{
    		if (status == 200)
    		{
    			var index = args.id - 1;
    			var link = links[index].l;
    			var URL = links[index].URL;
    			var a = newElement("a", { href: URL, class: "na" }, "<h2>" + args.id + "</h2>");
    			link.removeChild(link.childNodes[0]);
    			link.removeAttribute("id");
    			link.appendChild(a);
    		}
    	});
    	link.appendChild(h2);
    	list.appendChild(link);
    }
    cq.appendChild(list);
    lower.appendChild(cq);
}