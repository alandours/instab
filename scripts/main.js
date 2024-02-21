const debug = (...params) => console.log('Instab: ', params);

const createOpenBtn = (source) => {
  const openBtn = document.createElement('a');
  openBtn.className = 'instab-btn instab-open';
  openBtn.innerHTML = 'Open';
  openBtn.target = '_blank';
  openBtn.href = source;

  return openBtn;
};

const createSaveBtn = (source, username) => {
  const saveBtn = document.createElement('a');
  saveBtn.className = 'instab-btn instab-save';
  saveBtn.innerHTML = 'Save';

  saveBtn.addEventListener('click', (e) => {
    e.preventDefault();
    browser.runtime.sendMessage({ url: source, username });
  });

  return saveBtn;
};

const getUsername = (media) => {
  try {
    const parentElement = isStory() ? 'section' : 'article';
    const mediaParent = media.closest(parentElement);
    const mediaHeaderLinks = mediaParent.querySelectorAll('header a');
    const profileLink = [...mediaHeaderLinks].find(headerLink => !headerLink.querySelector('img'));
    return profileLink.textContent;
  } catch (e) {
    return null;
  }
};

const addButtons = (media) => {
  if (!media.length) return;

  media.forEach((element) => {
    let source = isBlob(element.src) ? null : element.src;

    if (isStory()) {
      const srcset = element.srcset;
      source = srcset ? srcset.split(',')[0] : element.getElementsByTagName('source')[0].src; //For videos on stories
    }

    const mediaContainer = element.parentNode.parentNode;

    if (source && !mediaContainer.classList.contains('instab-container')) {
      mediaContainer.classList.add('instab-container');

      if (isStory()) {
        mediaContainer.classList.add('instab-container-stories');
      }

      if (instabId !== 0) {
        mediaContainer.classList.add(`instab-container-${instabId}`);
      }

      const username = getUsername(element);

      const openBtn = createOpenBtn(source);
      const saveBtn = createSaveBtn(source, username);

      mediaContainer.appendChild(openBtn);
      mediaContainer.appendChild(saveBtn);
    }
  })
};

const isLargerThan350 = (img) => {
  const { width } = isStory() ? img.getBoundingClientRect() : img;
  return width > 350;
};

const isVideoPoster = (img) => {
  return !!img.closest('article').querySelector('video');
};

const getLargeImages = () => {
  const images = document.querySelectorAll('img');
  const filteredImages = images.length ? [...images].filter(img => img && isLargerThan350(img) && !isVideoPoster(img)) : [];
  return filteredImages;
};

const addInstab = () => {
  addButtons(getLargeImages());
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
const isBlob = (media) => /blob/.test(media);
const isVideo = (media) => media.tagName.toLowerCase() === 'video';

let instabId = 0;

const instabObserver = new MutationObserver(addInstab);

document.body.addEventListener('click', () => {
  handleClick();
});
