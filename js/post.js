const postInterval = setInterval(() => {
  const instabBtn = document.querySelector('.instab-btn');

  if (!instabBtn) {
    addInstab();
    clearInterval(postInterval);
  }
}, 250);