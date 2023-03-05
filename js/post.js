const postInterval = setInterval(() => {
  const instabBtn = document.querySelector('.instab-btn');

  if (instabBtn) {
    clearInterval(postInterval);
  } else {
    addInstab(true);
  }
}, 100);