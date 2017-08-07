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
	var weeks = long[date.month] ? 5 : 4;
	var lower = document.getElementById("lower");
	var block = newElement("div", { class: "content block" });
	var list = monthLinks(date);
    block.appendChild(newElement("div", { class: "month" }, "<h2>" + date.month + "</h2>"));
    block.appendChild(list);
    block.appendChild(newElement("a", { href: "http://recap.agdg.io/timeline", class: "na blink" }, "<h2>timeline</h2>"));
    lower.appendChild(block);
}