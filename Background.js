(function() {
    'use strict';
    
    //Message Listeners
    chrome.runtime.onMessage.addListener(
        function(request, sender, sendResponse) {   
            if ((request.from === 'crumbly') && (request.subject === 'openNewTab')) {
                //We recieve this request if the content page wants to open a new browser tab
                LogMessage("openNewTab request receieved.")

                //Get active tab so we can open the new tab immediately to the right
                chrome.tabs.query({
                    active: true, currentWindow: true
                    }, tabs => {
                        console.log(tabs[0]);
                        let index = tabs[0].index;
                        //Create the new tab immediately to the right
                        chrome.tabs.create(
                            {url: request.url,
                            index: index + 1})
                    });
            }
    })

    //Write a message to the main page logs
    function LogMessage(message) {
        chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
            chrome.tabs.sendMessage(
                tabs[0].id,
                {from: 'background', subject: 'LogMessage', message: message},
                null,
                ()=>{chrome.runtime.lastError});
            });
    }
})();