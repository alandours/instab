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

const getVideoUrlFromScript = (poster) => {
  const scripts = document.querySelectorAll('script');

  if (!scripts || !scripts.length)
    return '';

  const scriptWithVideoData = [...scripts].find((sc) => {
    return /video_url/.test(sc.innerHTML);
  });

  if (!scriptWithVideoData)
    return '';

  const scriptRegex = new RegExp(String.raw`window.__additionalDataLoaded\('${window.location.pathname}',(.+)\)`);
  const scriptMatch = scriptWithVideoData.innerHTML.match(scriptRegex);
  const scriptString = scriptMatch && scriptMatch[1];
  const scriptData = scriptString && JSON.parse(String.raw`${scriptString}`);

  const { video_url, edge_sidecar_to_children } = scriptData.graphql.shortcode_media || {};

  if (video_url)
    return video_url;

  const { edges } = edge_sidecar_to_children || {};

  const posterRegex = /\/([^\/]+jpg)/;
  const posterMatch = poster.match(posterRegex);
  const posterUrl = posterMatch && posterMatch[1];

  const video = edges.find((edge) => edge.node.display_url.includes(posterUrl));

  return video.node.video_url;
};

const addButtons = (media) => {
  for (let i = 0; i < media.length; i++) {
    let source = media[i].src;

    if (isStory()) {
      const srcset = media[i].srcset;
      source = srcset ? srcset.split(',')[0] : media[i].getElementsByTagName('source')[0].src; //For videos on stories
    }
      
    if (isPostPage() && /blob/.test(media[i].src)) {
      const videoUrl = getVideoUrlFromScript(media[i].poster);
      source = videoUrl;
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

const noVideoSiblings = (images) => {
  return images.filter(img => !img.parentNode.querySelector('video'));
};

const getLargeImages = () => {
  const images = document.querySelectorAll('img');
  const largerThan350 = images.length ? [...images].filter(isLargerThan350) : [];
  return noVideoSiblings(largerThan350);
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
const isPostPage = () => /\/p\/.+/.test(window.location.pathname);
let instabId = 0;

const instabObserver = new MutationObserver(addInstab);

document.body.addEventListener('click', () => {
  handleClick();
});

const navbar = document.getElementsByTagName('nav');

for (let i = 0; i < navbar.length; i++) {
  navbar[i].classList.add('instab-navbar');
}