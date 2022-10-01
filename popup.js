'use strict';

//Event Listener for each button
function click(e) {
    //Tell the content script which button was pressed
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {       
        if(chrome.runtime.lastError) chrome.runtime.lastError;

        chrome.tabs.sendMessage(
            tabs[0].id,
            {from: 'popup', subject: 'buttonClicked', action: e.target.id},
            null,
            ()=>{chrome.runtime.lastError});
    });

    //close the popup
    window.close();
}

document.addEventListener('DOMContentLoaded', function () {
    //Select all divs
    var divs = document.querySelectorAll('div');

    //Loop through divs to add event listener on each 
    for (var i = 0; i < divs.length; i++) {
        divs[i].addEventListener('click', click);
    }
});