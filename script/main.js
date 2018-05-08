var results = [];
//User info.
var user = {};

getValidationResults();

function getValidationResults() {
    $.get(
        "../../../api/validationResults?fields=id,validationRule[id,displayName,validationRuleGroups[id]]&paging=false",
        function(data) {
            results = data.validationResults;
            $.get("../../../api/me/", function(userInfo) {
                user = userInfo;
                generateTabs(results);
            }).fail(function() {
                console.log("ERROR: Failed to fetch user info.");
            });
        }
    );
}

function isActive(id) {
    var currentURL = document.URL;
    var splitURL = currentURL.split('/');
    //Gets the id of current dashboard from URL.
    var idFromURL = splitURL[splitURL.length -1];
    console.log(idFromURL);
    if(idFromURL === id) {
        return 'active';
    }
    return '';
}

//Might be better to store the amount of notification for each in one go instead of one request per group.
function notificationNum(groupId) {
    var num = 0;
    $.get("../../../api/dataStore/userInteractionActionFeedback/" + user.id, function(data) {
        userInteractedActions = data.interactedActions;
        for(var i = 0; i < results.length; i++) {
            validationRuleGroupIds = results[i].validationRule.validationRuleGroups.map(function(obj){return obj.id;});
    
            if(validationRuleGroupIds.indexOf(groupId) > -1 && userInteractedActions.indexOf(results[i].id) < 0) {
                num++;
            }
        }
        return '' + num;
    }).fail(function() {
        for(var i = 0; i < results.length; i++) {
            validationRuleGroupIds = results[i].validationRule.validationRuleGroups.map(function(obj){return obj.id;});
    
            if(validationRuleGroupIds.indexOf(groupId) > -1 && userInteractedActions.indexOf(results[i].id) < 0) {
                num++;
            }
        }
        return '' + num;
    });
}

function generateTabs() {
    var parent = document.getElementById('tabs');
    var tabContainer = document.createElement('ul');
    tabContainer.className = "nav nav-pills nav-justified";
    var tabs = "";
    
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }

    $.get("../../../api/validationRuleGroups?paging=false", function(data) {
            groups = data.validationRuleGroups;
    });

    tabs += "<li class='" + isActive('test.html') + "' role='presentation'><a href='#' target='_top'>ANC <span class='badge'>" + notificationNum('UP1lctvalPn') + "</span></a></li>";
    tabs += "<li class='" + isActive('index.html') + "' role='presentation'><a href='#' target='_top'>Critical event <span class='badge'>3</span></a></li>";
    tabs += "<li class='" + isActive('test.html') + "' role='presentation'><a href='#' target='_top'>Malaria <span class='badge'>1</span></a></li>";

    tabContainer.innerHTML = tabs;
    parent.appendChild(tabContainer);
}