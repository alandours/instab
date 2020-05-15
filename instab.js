const addButtons = (media) => {
  for (let i = 0; i < media.length; i++) {
    const source = (media[i].src == '') ? media[i].getElementsByTagName('source')[0].src /* (For videos on stories) */ : media[i].src;

    const openBtn = document.createElement('a');
    openBtn.className = 'instab-btn instab-open';
    openBtn.innerHTML = 'Open';
    openBtn.target = '_blank';
    openBtn.href = source;

    const saveBtn = document.createElement('a');
    saveBtn.className = 'instab-btn instab-save';
    saveBtn.innerHTML = 'Save';

    saveBtn.addEventListener('click', (e) => {
      e.preventDefault();
      browser.runtime.sendMessage(source);
    });

    const mediaContainer = media[i].parentNode.parentNode;

    if (!mediaContainer.classList.contains('instab-container')) {
      mediaContainer.classList.add('instab-container');

      if (instabId !== 0)
        mediaContainer.classList.add(`instab-container-${instabId}`);

      mediaContainer.appendChild(openBtn);
      mediaContainer.appendChild(saveBtn);
    }
  }
};

const getLargeImages = () => {
  const images = document.getElementsByTagName('img');
  return images.length ? [...images].filter(img => img.width > 350) : [];
};

const addInstab = () => {
  const images = getLargeImages();
  const videos = document.getElementsByTagName('video');

  if (videos.length) addButtons(videos);
  if (images.length) addButtons(images);
};

const addInstabToNewPosts = () => {
  const images = getLargeImages();

  if (images.length) {
    const feed = images[0].closest('article').parentNode;
    const config = { childList: true };
    postsObserver.observe(feed, config);
  }
};

const handleClickPosts = () => {
  let tries = 0

  instabId = new Date().getTime();

  const instabExists = setInterval(() => {
    tries++

    const instabContainer = document.querySelector(`.instab-container-${instabId}`);

    addInstab();
    addInstabToNewPosts();

    if (instabContainer || tries > 5) {
      clearInterval(instabExists);
      instabId = 0;
    }
  }, 300);
};

const handleClickStories = () => {
  let tries = 0;

  const storiesInterval = setInterval(() => {
    tries++;

    const storiesContainer = document.querySelector('.yS4wN');

    if (storiesContainer) {
      addInstab();
      storiesObserver.observe(storiesContainer, { subtree: true, childList: true });
      clearInterval(storiesInterval);
    } else if (tries > 15) {
      clearInterval(storiesInterval);
    }
  }, 300);
};

const browser = chrome || browser;

const postsObserver = new MutationObserver(addInstab);
const storiesObserver = new MutationObserver(addInstab);

const body = document.getElementsByTagName('body')[0];

let instabId = 0;

body.addEventListener('click', () => {
  handleClickPosts();
  handleClickStories();
});

const navbar = document.getElementsByTagName('nav');

for (let i = 0; i < navbar.length; i++) {
  navbar[i].classList.add('instab-navbar');
}

addInstabToNewPosts();

addInstab();