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

            if(instabId !== 0){
                mediaContainer.classList.add(`instab-container-${instabId}`);
            }

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

    if(images.length > 0){

        const mainContainer = images[0].closest('article').parentNode;

        const config = { childList: true };

        postsObserver.observe(mainContainer, config);

    }

}

const browser = chrome || browser;

const postsObserver = new MutationObserver(addInstab);
const storiesObserver = new MutationObserver(addInstab);

const body = document.getElementsByTagName('body')[0];

let instabId = 0;

body.addEventListener('click', () => {

    instabId = new Date().getTime();

    let tries = 0

    const instabExists = setInterval(() => {

        tries++

        addInstab();

        if(document.querySelector(`.instab-container-${instabId}`) || tries > 5){

            clearInterval(instabExists);

            instabId = 0;

        }

    }, 300);

    
    setTimeout(() => {
    
        const storiesContainer = document.querySelector('.yS4wN');

        if(storiesContainer !== null){

            storiesObserver.observe(storiesContainer, { subtree: true, childList: true });

        }else{

            storiesObserver.disconnect();

        }

    }, 2000);

});

const navbar = document.getElementsByTagName('nav');

for(let i = 0; i < navbar.length; i++){

    navbar[i].classList.add('instab-navbar');

}

addInstabToNewPosts();

addInstab();