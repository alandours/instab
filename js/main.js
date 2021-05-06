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

const createNewTabBtn = (mediaContainer) => {
  const time = mediaContainer.closest('article').querySelector('time');
  const timeUrl = time && time.parentNode && time.parentNode.href;
  const url = window.location.pathname.includes('/p/') ? window.location.pathname : timeUrl;

  const newTabBtn = document.createElement('a');
  newTabBtn.className = 'instab-btn instab-new-tab';
  newTabBtn.innerHTML = 'Open post in a new tab to download or open this video';
  newTabBtn.target = '_blank';
  newTabBtn.href = url;

  return newTabBtn;
};

const getVideoDataScript = (scripts) => {
  return [...scripts].find((sc) => {
    return /video_url/.test(sc.innerHTML);
  });
};

const getPosterImageName = (poster) => {
  const regex = /\/([^\/]+jpg)/;
  const match = poster.match(regex);
  return match && match[1];
};

const getScriptString = (videoDataScript) => {
  const regex = new RegExp(String.raw`window.__additionalDataLoaded\('${window.location.pathname}',(.+)\)`);
  const match = videoDataScript.innerHTML.match(regex);
  return match && match[1];
};

const getSharedDataScriptString = (videoDataScript) => {
  const regex = /window._sharedData = (.+);/
  const match = videoDataScript.innerHTML.match(regex);
  return match && match[1];
};

const getVideoSrcFromScript = (poster) => {
  const scripts = document.querySelectorAll('script');

  if (!scripts || !scripts.length) return '';

  const videoDataScript = getVideoDataScript(scripts);

  if (!videoDataScript) return '';

  const posterImageName = getPosterImageName(poster);
  const scriptString = getScriptString(videoDataScript);

  if (scriptString) {
    const scriptData = JSON.parse(String.raw`${scriptString}`);

    const { video_url, edge_sidecar_to_children } = scriptData.graphql.shortcode_media || {};

    if (video_url)
      return video_url;

    const { edges } = edge_sidecar_to_children || {};

    const video = edges.find((edge) => edge.node.display_url.includes(posterImageName));

    return video.node.video_url;
  }

  const sharedDataScriptString = getSharedDataScriptString(videoDataScript);
  const sharedData = sharedDataScriptString && JSON.parse(String.raw`${sharedDataScriptString}`);

  if (!sharedData) return;

  const { edges } = sharedData.entry_data.ProfilePage[0].graphql.user.edge_owner_to_timeline_media || {};

  const video = edges.reduce((acc, edge) => {
    if (edge.node.__typename === 'GraphVideo' && edge.node.display_url.includes(posterImageName)) {
      return edge.node.video_url;
    }
    
    if (edge.node.__typename === 'GraphSidecar') {
      const video = edge.node.edge_sidecar_to_children.edges.find(e => e.node.display_url.includes(posterImageName));
      if (video) return video.node.video_url;
    }

    return acc;
  }, '');

  return video;
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
  for (let i = 0; i < media.length; i++) {
    let source = media[i].src;

    if (isStory()) {
      const srcset = media[i].srcset;
      source = srcset ? srcset.split(',')[0] : media[i].getElementsByTagName('source')[0].src; //For videos on stories
    }
      
    if (isBlob(media[i].src)) {
      const videoUrl = getVideoSrcFromScript(media[i].poster);
      source = videoUrl;
    }

    const mediaContainer = media[i].parentNode.parentNode;

    if (source && !mediaContainer.classList.contains('instab-container')) {
      mediaContainer.classList.add('instab-container');

      if (isStory())
        mediaContainer.classList.add('instab-container-stories');

      if (instabId !== 0)
        mediaContainer.classList.add(`instab-container-${instabId}`);

      const username = getUsername(media[i]);

      const openBtn = createOpenBtn(source);
      const saveBtn = createSaveBtn(source, username);

      mediaContainer.appendChild(openBtn);
      mediaContainer.appendChild(saveBtn);

      const newTabBtn = mediaContainer.querySelector('.instab-new-tab');

      if (newTabBtn)
        mediaContainer.removeChild(newTabBtn);
    } else if (!source && isVideo(media[i]) && !mediaContainer.querySelector('.instab-new-tab')) {
      const newTabBtn = createNewTabBtn(mediaContainer);
      mediaContainer.appendChild(newTabBtn);
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
const isBlob = (media) => /blob/.test(media);
const isVideo = (media) => media.tagName.toLowerCase() === 'video';

let instabId = 0;

const instabObserver = new MutationObserver(addInstab);

document.body.addEventListener('click', () => {
  handleClick();
});

const navbar = document.getElementsByTagName('nav');

for (let i = 0; i < navbar.length; i++) {
  navbar[i].classList.add('instab-navbar');
}