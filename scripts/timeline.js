var july = 6;
var links = [];

$(document).ready(function()
{
	buildTimeline();
});

function buildTimeline()
{
	var tl = document.getElementById("timeline");
	var year = newElement("div", { class: "content block year" });
	var block = newElement("div", { class: "content block" });
	year.appendChild(newElement("h2", {}, "2017"));
	tl.appendChild(year);
	for (var i = july; i < months.length; i++)
	{
		var date = dateData(i);
		var list = monthLinks({ month: months[i], id: date.id}, true);
	    block.appendChild(list);
	    tl.appendChild(block);
	}
}