const browser = chrome || browser;

browser.runtime.onMessage.addListener(downloadPhoto);

function downloadPhoto(url){
    browser.downloads.download({
        url: url,
        saveAs: true
    });
}