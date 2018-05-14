//Sets id of iframe so that it can be fetched by other apps.
window.frameElement.id = 'tabsApp';
//All validation results.
var results = [];
//User info.
var user = {};
//All notifications indexed on validation group.
var notifications = {};

var allDownIdOrgUnits = [];

getValidationResults();

function getValidationResults() {
    $.get(
        "../../../api/validationResults?fields=id,organisationUnit,validationRule[id,displayName,validationRuleGroups[id]]&paging=false",
        function(data) {
             results = data.validationResults;
            $.get("../../../api/me/", function(userInfo) {
                user = userInfo;
                filteOrgUnits();
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
    if(idFromURL === id) {
        return 'active';
    }
    return '';
}

function filteOrgUnits() {
    var allOrgUnits = [];
    var userOrgunits = [];

    $.get("../../../api/organisationUnits.json?fields=id,name,children[id,name]&paging=false", function(response) {
        allOrgUnits = response.organisationUnits;

        for(var i = 0; i < user.organisationUnits.length; i++) {
            userOrgunits.push(user.organisationUnits[i].id);
        }

        for(var i = 0; i < allOrgUnits.length; i++) {
            if(userOrgunits.indexOf(allOrgUnits[i].id) > -1){
                getAllRelated(allOrgUnits[i]);                               
            }  
        }

        //Recursive methode for finding all related orgUnits.
        function getAllRelated(ou) {
            for(var i = 0; i < allOrgUnits.length; i++) {
                if(allOrgUnits[i].id === ou.id){
                    if(allDownIdOrgUnits.indexOf(allOrgUnits[i].id) < 0) {
                        allDownIdOrgUnits.push(allOrgUnits[i].id);
                    }                      
                    if(!allOrgUnits[i].children) {
                        return;
                    } else {
                        for(var j = 0; j < allOrgUnits[i].children.length; j++) {
                            getAllRelated(allOrgUnits[i].children[j]);
                        }   
                    }                         
                }
            }
        }
        notificationNumAll();
    });
    
    
}

//Might be better to store the amount of notification for each in one go instead of one request per group.
function notificationNumAll() {
    $.get("../../../api/dataStore/userInteractionActionFeedback/" + user.id, function(data) {
        userInteractedActions = data.interactedActions;
        for(var i = 0; i < results.length; i++) {
            var id = results[i].id + "";
            if(userInteractedActions.indexOf(id) < 0 && allDownIdOrgUnits.indexOf(results[i].organisationUnit.id) > -1) {
                validationRuleGroupIds = results[i].validationRule.validationRuleGroups.map(function(obj){return obj.id;});
                for(var j = 0; j < validationRuleGroupIds.length; j++) {
                    if(!notifications[validationRuleGroupIds[j]]) {
                        notifications[validationRuleGroupIds[j]] = 1;
                    } else {
                        notifications[validationRuleGroupIds[j]]++;
                    }
                }
            }
        }
        generateTabs();
    }).fail(function() {
        for(var i = 0; i < results.length; i++) {
            if(allDownIdOrgUnits.indexOf(results[i].organisationUnit.id) > -1) {
                validationRuleGroupIds = results[i].validationRule.validationRuleGroups.map(function(obj){return obj.id;});
                for(var j = 0; j < validationRuleGroupIds.length; j++) {
                    if(!notifications[validationRuleGroupIds[j]]) {
                        notifications[validationRuleGroupIds[j]] = 1;
                    } else {
                        notifications[validationRuleGroupIds[j]]++;
                    }
                }
            }
        }
        generateTabs();
    });
}

function getNotifications(id) {
    if(notifications[id]) {
        return notifications[id];
    }
    return "";
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

    tabs += "<li class='" + isActive('test.html') + "' role='presentation'><a href='#' target='_top'>ANC <span id='UP1lctvalPn' class='badge'>" + getNotifications('UP1lctvalPn') + "</span></a></li>";
    tabs += "<li class='" + isActive('index.html') + "' role='presentation'><a href='#' target='_top'>Critical event <span id='xWtt9c443Lt' class='badge'>" + getNotifications('xWtt9c443Lt') + "</span></a></li>";
    tabs += "<li class='" + isActive('test.html') + "' role='presentation'><a href='#' target='_top'>Malaria <span id='zlaSof6qLqF' class='badge'>" + getNotifications('zlaSof6qLqF') + "</span></a></li>";

    tabContainer.innerHTML = tabs;
    parent.appendChild(tabContainer);
}