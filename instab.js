const addButtons = (media) => {

    for(let i = 0; i < media.length; i++){

        const openBtn = document.createElement('a');
        openBtn.className = 'instab-btn instab-open';
        openBtn.innerHTML = 'Open';
        openBtn.target = '_blank';

        let source;

        if(media[i].src == ''){
            source = media[i].getElementsByTagName('source')[0].src; /* For videos on stories */
        }else{
            source = media[i].src;
        }

        openBtn.href = source;
    
        const saveBtn = document.createElement('a');
        saveBtn.className = 'instab-btn instab-save';
        saveBtn.innerHTML = 'Save';

        saveBtn.addEventListener('click', (e) => {
            e.preventDefault();
            browser.runtime.sendMessage(source);
        });

        const mediaContainer = media[i].parentNode.parentNode;

        if(!mediaContainer.classList.contains('instab-container')){

            mediaContainer.classList.add('instab-container');

            mediaContainer.appendChild(openBtn);
            mediaContainer.appendChild(saveBtn);

        }

    }

}

const getLargeImages = () => {

    const images = document.getElementsByTagName('img');

    return [...images].filter(img => img.width > 350);

}

const addInstab = () => {

    const photos = getLargeImages();
    const videos = document.getElementsByTagName('video');

    if(videos.length != 0){
        addButtons(videos);
    }

    if(photos.length != 0){
        addButtons(photos);
    }

}

const addInstabToNewPosts = () => {

    const images = getLargeImages();
    const mainContainer = images[0].closest('article').parentNode;

    let observer = new MutationObserver(addInstab);
    const config = { childList: true };

    observer.observe(mainContainer, config);
    
}

let browser = chrome || browser;

const body = document.getElementsByTagName('body')[0];

body.addEventListener('click', () => {

    setTimeout(() => {
        addInstab();
    }, 500);

});

const navbar = document.getElementsByTagName('nav');

for(let i = 0; i < navbar.length; i++){

    navbar[i].classList.add('instab-navbar');

}

addInstabToNewPosts();

addInstab();




