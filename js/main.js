const createOpenBtn = (source) => {
  const openBtn = document.createElement('a');
  openBtn.className = 'instab-btn instab-open';
  openBtn.innerHTML = 'Open';
  openBtn.target = '_blank';
  openBtn.href = source;

  return openBtn;
};

const createSaveBtn = (source) => {
  const saveBtn = document.createElement('a');
  saveBtn.className = 'instab-btn instab-save';
  saveBtn.innerHTML = 'Save';

  saveBtn.addEventListener('click', (e) => {
    e.preventDefault();
    browser.runtime.sendMessage(source);
  });

  return saveBtn;
};

const addButtons = (media) => {
  for (let i = 0; i < media.length; i++) {
    let source = media[i].src;

    if (isStory()) {
      const srcset = media[i].srcset;
      source = srcset ? srcset.split(',')[0] : media[i].getElementsByTagName('source')[0].src; //For videos on stories
    }

    const mediaContainer = media[i].parentNode.parentNode;

    if (source && !mediaContainer.classList.contains('instab-container')) {
      mediaContainer.classList.add('instab-container');

      if (isStory())
        mediaContainer.classList.add('instab-container-stories');

      if (instabId !== 0)
        mediaContainer.classList.add(`instab-container-${instabId}`);

      const openBtn = createOpenBtn(source);
      const saveBtn = createSaveBtn(source);

      mediaContainer.appendChild(openBtn);
      mediaContainer.appendChild(saveBtn);
    }
  }
};

const isLargerThan350 = (img) => {
  const { width } = isStory() ? img.getBoundingClientRect() : img;
  return width > 350;
};

const getLargeImages = () => {
  const images = document.getElementsByTagName('img');

  return images.length ? [...images].filter(isLargerThan350) : [];
};

const addInstab = () => {
  const images = getLargeImages();
  const videos = document.getElementsByTagName('video');

  if (videos.length) addButtons(videos);
  if (images.length) addButtons(images);
};

const handleClick = () => {
  let tries = 0;

  const interval = setInterval(() => {
    tries++;

    if (isStory()) {
      addInstab();
      instabObserver.observe(document.body, { subtree: true, childList: true });
      clearInterval(interval);
    } else {
      instabId = new Date().getTime();
  
      const instabContainer = document.querySelector(`.instab-container-${instabId}`);
      addInstab();
  
      if (instabContainer || tries > 15) {
        clearInterval(interval);
        instabId = 0;
      }
    }
  }, 300);
}

const browser = chrome || browser;
const isStory = () => /stories/.test(window.location.href);
let instabId = 0;

const instabObserver = new MutationObserver(addInstab);

document.body.addEventListener('click', () => {
  handleClick();
});

const navbar = document.getElementsByTagName('nav');

for (let i = 0; i < navbar.length; i++) {
  navbar[i].classList.add('instab-navbar');
}