'use strict';

//variables
let debug = false;

//Wrapper for console.log. Only prints message if debug is TRUE
function LogMessage(message) {
    if (debug) {
        console.log(message);
    }
}

//Gets a link to the direct code page and line
function getLinkToCurrentLine() {
    let lineNum = 0;

    //Find current line
    let currentLineElem = document.getElementsByClassName('current-line');
    
    //Get Line Number
    if (currentLineElem != null && currentLineElem[0] != null) {
        let parentElem = currentLineElem[0].parentElement;
        let lineNumElem = parentElem.getElementsByClassName('line-numbers')[0];
        
        lineNum = lineNumElem.innerText;
        LogMessage("Line Number: " + lineNum);
    }

    //Get Link to Page
    let header = document.getElementsByClassName('fileName-header');
    let link = header[0] ?  header[0].getElementsByClassName('bolt-link')[0].href : null;
    let suffix = `&line=${lineNum}&lineStyle=plain&lineEnd=${++lineNum}&lineStartColumn=1&lineEndColumn=1`;

    LogMessage("Link: " + link + suffix);

    if (link != null && lineNum != null) {
        //return URL
        return `${link}${suffix}`
    } else {
        //Probably on a direct link page. Use current URL
        let url = location.href;
        let index = url.indexOf('&'); //first instance of '&'

        if (index == -1) return url

        //return substring of url up until the '&'
        return `${url.substring(0,index)}${suffix}`
    }
}

//Get the text currently highlighted on the screen
function getSelectionText() {
    let text = ""

    if (window.getSelection) {
        text = window.getSelection().toString()
    } else if (document.selection && document.selection.type != "Control") {
        text = document.selection.createRange().text
    }

    if (text.length == 0) {
        //could not find highlighted text, try to use whatever is in the Ctrl + F box
        let tempText = document.querySelector("textarea[title=Find]")
    
        if (tempText != null && tempText.nextElementSibling) {
            //Use the contents of the Ctrl + F box if defined or the full text of the current line if not
            text = tempText.nextElementSibling.innerHTML.length > 0 ? tempText.nextElementSibling.innerHTML : text
        } 
    }

    if (text.length == 0) {
        text = '"Could not identify any highlighted text. Try Again."'
    }

    return text;
}

//Get link to a search page based on the hightlighted text
function getLinkToSearch(url,prefix,suffix) {
    let regex = /&text=.+?&/; //Search for text matching the pattern &text=<any text>&
    let newSearchText = getSelectionText();

    if (newSearchText == "") {
        LogMessage('"Could not identify selected text. Will not open a new tab."');
        return '';
    };

    if (url.indexOf('&text=') > -1) {
        //currently on a search page
        let newSearch = '&text=' + prefix + newSearchText + suffix + '&';
        let searchURL = url.replace(regex, newSearch);
        LogMessage("New Search URL: " + searchURL.toString());
    
        //Open the URL in a new tab
        //openURLInNewTab(searchURL);
        return searchURL;
    } else {
        //currently on a direct link page, need to build the full search url
        let endIndex = url.indexOf('/_git/')

        if (endIndex == -1) return url

        let searchURL = url.substring(0,endIndex)
        return `${searchURL}/_search?action=contents&text=${newSearchText}&type=code`;
    }
}

//Sends message to background page to open the passed url in a new tab
function openURLInNewTab(url) {
    if (url == '') return;

    chrome.runtime.sendMessage(
        {from: 'crumbly', subject: 'openNewTab', url:url},
        ()=>{chrome.runtime.lastError}
    );
}

//Listen for messages
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {   
        if ((request.from === 'background') && (request.subject === 'LogMessage')) {
            //The background page wants to log a debug message
            LogMessage("[BG] " + request.message);
        } else if ((request.from === 'popup') && (request.subject === 'buttonClicked')) {
            let link = '';

            switch(request.action) {
                case 'search1':
                    LogMessage("Popup Search1 clicked.");
                    link = getLinkToSearch(location.href,'','');
                    break;
                case 'search2':
                    LogMessage("Popup Search2 clicked.");
                    link = getLinkToSearch(location.href,'"','"');
                    break;
                case 'search3':
                    LogMessage("Popup Search3 clicked.");
                    link = getLinkToSearch(location.href,'def:','');
                    break;
                case 'search4':
                    LogMessage("Popup Search4 clicked.");
                    link = getLinkToSearch(location.href,'class:','');
                    break;
                case 'open1':
                    LogMessage("Popup Open1 clicked.");
                    link = getLinkToCurrentLine();
                    break;
            }

            //Open the link. Returns immediately if link is empty string
            openURLInNewTab(link);
        }
})

LogMessage("Crumbly: Script Fully Loaded.");


