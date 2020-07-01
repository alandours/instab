const init = (mutations) => {
  mutations.forEach((mutation) => {
    const { addedNodes } = mutation || {};
    if (!addedNodes) return;

    addedNodes.forEach(node => {
      const tagName = node.tagName.toLowerCase();

      if (tagName === 'article' && !node.querySelector('.instab-btn')) {
          addInstab();
          addPostsObserver();
          bodyObserver.disconnect();
      }
    });
  });
};

const bodyObserver = new MutationObserver(init);
bodyObserver.observe(document.body, { childList: true, subtree: true });