var enter = 13;
var links = [];

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

function buildLinks()
{
	var date = dateData();
	var lower = document.getElementById("lower");
	var block = newElement("div", { class: "content block" });
	var links = monthLinks(date);
	var buttons = newElement("div", { class: "list" });
    block.appendChild(newElement("div", { class: "month" }, "<h2>" + date.month + "</h2>"));
    block.appendChild(links);
    buttons.appendChild(newElement("a", { href: "http://recap.agdg.io/timeline", class: "na link underline" }, "<h2>timeline</h2>"));
    buttons.appendChild(newElement("a", { href: "http://recap.agdg.io/info", class: "na link underline" }, "<h2>info</h2>"));
    buttons.appendChild(newElement("a", { href: "http://recap.agdg.io/scores", class: "na link underline" }, "<h2>scores</h2>"));
    block.appendChild(buttons);
    lower.appendChild(block);
}