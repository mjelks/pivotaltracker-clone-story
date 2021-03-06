// add jQuery -- we need this for DOM manipulation
if (typeof jQuery=='undefined') { 
    script = document.createElement( 'script' );  
    script.src = '//ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js';   
    document.body.appendChild(script);  
} 

/* 
    iterate through labels:
    click the label dropdown, 
    then loop through each label and click on the label that matches the text string
    final click disengages the label dropdown
*/
function labelClone(selector, labels) {
    if (labels) {
        var node = $(selector).find("a[id^='labels_dropdown_dropdown']").first();
   
        node.click();
        node.parents(".dropdown").find("li.dropdown_item").each(function(e) { 
            if (jQuery.inArray($(this).text(),labels) >= 0) { 
                $(this).mouseenter().click();
            } 
        });
        node.click();
    }
}

function titleClone(selector, storyTitle) {
    $(selector).find("[id^=story_name]").text(storyTitle);
}  

// click on the story_type dropdown, then match the storyType that is passed in and select it 
function storyTypeClone(selector, storyType) {
    $(selector).find("a[id^='story_type_dropdown'].search").first().click();
    var storyTypes = $(".dropdown.story_type ul").first().find("li");
    storyTypes.each( function( index ) { 
        if ($(this).attr("data-value") == storyType) {
            $(selector).find("a[id^='story_type_dropdown']").first().click();
            $(selector).find("a.item_"+storyType).mouseenter().click();
        }
    });
}

// click on the owner dropdown, then match the owner that is passed in and select it 
function ownerNameClone(selector, ownerName) {
    $(selector).find("a[id^='story_owned_by_id_dropdown']").first().click();
    var storyTypes = $(".dropdown.story_owned_by_id ul").first().find("li");
    storyTypes.each( function( index ) { 
        if ($(this).text() == ownerName) {
            $(this).find("a").first().mouseenter().click();
        }
    });
}

// TODO: DI would be better instead of passing in 'selector'
function getter(selector, key) {
    var returnValue;
    switch(key) {
        case 'storyTitle':
            returnValue = $(selector).text();
            break;  
        case 'storyType':
            returnValue = $(selector).parents("form").find("input[name='story[story_type]']").val();
            break;
        case 'ownerName':
            returnValue = $("a[id^=story_owned_by_id_dropdown]").text();
            break;  
        default:
            returnValue = [];
    }
    return returnValue;
}

/* 
    this method grabs the contents of the currently selected story,
    then relies on the MutationObserver functionality that is part of the latest browsers to
    handle DOM change to grab data and insert into new story element
*/
function clonePivotalTicket() {  
    if(!$("input,textarea").is(":focus")) {
        alert("Please place focus on the input/textarea of the desired ticket before proceeding");
    } 
    else {
        var selector = "*:focus";
        // story_name_c422 => story_collapser_c422
        var collapser_selector = $(selector).attr("id").replace(/story_.+_(.+)/,"story_collapser_$1");
        var obj = {
            storyTitle  :   getter(selector,'storyTitle'),
            ownerName   :   getter(selector,'ownerName'),
            storyType   :   getter(selector, 'storyType'),
            labels      :   getter(selector, '')
        };

        $(selector).parents("section.edit").find("ul.selected.labels li").each (function (i) { 
            var label = $(this).find("a.label.name").text();
            if (label) {
                obj['labels'].push(label);
            }
        });
        // create 
        $('<input/>').attr({ type: 'hidden', class: 'clone_element', name: 'clone_element', value: JSON.stringify(obj) }).appendTo('body');
        observer.observe(target, config);    
        $("button.add_story").click();
        
        // collapse the original story that you are cloning:
        $("#"+collapser_selector).click();
    }
}


/*
    this is the all important MutationObserver that handles the DOM change, 
    and fills in the new story ticket
*/    
var observer = new MutationObserver(function( mutations ) {
    var selector = ".story.model.unscheduled.new";
    var obj = JSON.parse($('input[name="clone_element"]').last().val());
    titleClone(selector, obj.storyTitle);
    storyTypeClone(selector, obj.storyType);
    ownerNameClone(selector, obj.ownerName);
    labelClone(selector, obj.labels);
});

var target = document.querySelector('body');
var config = { 
    attributes: true, 
    childList: true, 
    characterData: true 
};



clonePivotalTicket();  

