var enter = 13;

$(function()
{
	$("#field").on('keyup', function(e)
	{
	    if (e.keyCode == enter)
	    {
	        var field = document.getElementById("field");
        	window.location = "http://recap.agdg.io/view?id=" + field.value;
	    }
	});
});