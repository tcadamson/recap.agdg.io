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