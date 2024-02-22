const browser = chrome || browser;

const debug = (...params) => console.log('Instab: ', params);

const isStory = () => /stories/.test(window.location.href);
const isBlob = (media) => /blob/.test(media);
const isVideo = (media) => media.tagName.toLowerCase() === 'video';

/**
 * Creates an Open button
 * @param {string} source - Media source url
 * @returns {HTMLButtonElement} Open button
 */
const createOpenBtn = (source) => {
  const openBtn = document.createElement('a');
  openBtn.className = 'instab-btn instab-open';
  openBtn.innerHTML = 'Open';
  openBtn.target = '_blank';
  openBtn.href = source;

  openBtn.addEventListener('click', (e) => {
    // Prevents showing tagged users when clicking the button
    e.stopPropagation();
  });

  return openBtn;
};

/**
 * Creates a Save button
 * @param {string} source - Media source url
 * @param {string|null} username - Username
 * @returns {HTMLButtonElement} Save button
 */
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

/**
 * Returns the username
 * @param {HTMLImageElement} media - Media element
 * @returns {string|null} Username
 */
const getUsername = (media) => {
  try {
    const parentElement = isStory() ? 'section' : 'article';
    const mediaParent = media.closest(parentElement);
    const mediaLinks = mediaParent.querySelectorAll('a');
    // Profile links (/profile or instagram.com/profile) that contain the username (not the profile picture)
    const profileLinks = [...mediaLinks].filter(link => /^(.+instagram\.com)?\/[^\/]+\/?$/.test(link.href) && !link.querySelector('img'))
    return profileLinks[0].textContent;
  } catch (e) {
    return null;
  }
};

/**
 * Adds Open and Save buttons to media
 * @param {HTMLImageElement} media - Media element
 */
const addButtons = (media) => {
  if (!media.length) return;

  media.forEach((element) => {
    const source = element.src;

    const mediaContainer = element.parentNode.parentNode;

    // Prevents adding multiple buttons to the same container
    if (source && !mediaContainer.classList.contains('instab-container')) {
      mediaContainer.classList.add('instab-container');

      if (isStory()) {
        mediaContainer.classList.add('instab-container-stories');
      }

      const username = getUsername(element);

      const openBtn = createOpenBtn(source);
      const saveBtn = createSaveBtn(source, username);

      mediaContainer.appendChild(openBtn);
      mediaContainer.appendChild(saveBtn);
    }
  })
};

/**
 * Returns true if the image width > 350px (skips thumbnails)
 * @param {HTMLImageElement} image - Image element
 * @returns {boolean}
 */
const isLargerThan350 = (image) => {
  const { width } = isStory() ? image.getBoundingClientRect() : image;
  return width > 350;
};

/**
 * Returns true if the image is a video poster (if the image's parent has also a video child the image is likely a video poster)
 * @param {HTMLImageElement} image - Image element
 * @returns {boolean}
 */
const isVideoPoster = (image) => {
  return !!image?.closest('article')?.querySelector('video');
};

/**
 * Gets large images that are not a video poster
 * @returns {HTMLImageElement[]|[]}
 */
const getLargeImages = () => {
  const images = document.querySelectorAll('img');
  const filteredImages = images.length ? [...images].filter(img => img && isLargerThan350(img) && !isVideoPoster(img)) : [];
  return filteredImages;
};

/**
 * Adds Instab buttons to large images
 */
const addInstab = () => {
  addButtons(getLargeImages());
};

const instabObserver = new MutationObserver(addInstab);

// Adds Instab buttons when the user clicks the body (for example: opening a post modal in the profile) and watches for changes in the body
document.body.addEventListener('click', () => {
  addInstab();
  instabObserver.observe(document.body, { subtree: true, childList: true });
});
