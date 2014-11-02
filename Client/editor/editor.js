/**
 * %SRPG%
 * 2011 Kevin Tyma (drachlen@gmail.com)
 * 
 **/

var currentCategory = -1;
jQuery(document).ready(function()
{
    $('.headerbutton').click(function()
    {
        var category = this.getAttribute("cat");
        loadCategory(category);
        $('.headerbutton').css('border-color', '#222');
        $(this).css('border-color','#7d9');
    });
});

function loadCategory(category)
{
    $.ajax(
    {
        type: "GET",
        url: category+'.php',
        data: '',
        success: function(data)
        {
            $('#view').show();
            $('#view').html(data);
        }
    });
}
