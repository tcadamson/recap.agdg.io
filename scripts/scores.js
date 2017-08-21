var l = 0;
var r = 1;
var ranges = [
	[1, 199],
	[200, 499],
	[500, 999],
	[1000]
]

$(document).ready(function()
{
	jsonLoad("res/scores.json", function(data)
    {
        buildScores(data);
    });
});

function loadContainer(jsonData)
{
	var container = [];
	for (var id in jsonData)
	{
		var entry = jsonData[id];
		entry.id = id;
		container.push(entry);
	}
	container.sort(function(a, b)
	{
		return b.score - a.score;
	});
	return container;
}

function resolveTier(tiers, item)
{
	for (var i = 0; i < tiers.length; i++)
	{
		if ((!ranges[i][r] && item.score >= ranges[i][l]) || (item.score >= ranges[i][l] && item.score <= ranges[i][r]))
		{
			var string = item.score + " - " + item.id;
			if (item.streak > 1 && item.inactive == 0) string += " (x" + item.mult + ", " + item.streak + " streak)";
			tiers[i].appendChild(newElement("p", {}, string + "<br>"));
		}
	}
}

function buildScores(jsonData)
{
	var scores = document.getElementById("page");
	var container = loadContainer(jsonData);
	var tiers = [];
	for (var i = ranges.length - 1; i >= 0; i--)
	{
		var tier = newElement("div", { class: "content" });
		var lstr = "[ " + ranges[i][l]
		var rstr = "+ ]"
		if (ranges[i][r]) rstr = " - " + ranges[i][r] + " ]"
		tier.appendChild(newElement("h2", {}, lstr + rstr));
		if (i < ranges.length - 1) scores.appendChild(newElement("div", { class: "spacer45" }));
		scores.appendChild(tier);
		tiers[i] = tier;
	}
	for (var i = 0; i < container.length; i++)
	{
		var item = container[i];
		resolveTier(tiers, item);
	}
	scores.appendChild(newElement("div", { class: "spacer60" }))
}