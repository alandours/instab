const changeUserAgent = () => {
  const navigator = window.navigator;
  let newNavigator;
  const userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1'

  if ('userAgent' in Navigator.prototype) {
    newNavigator = Navigator.prototype;
  } else {
    newNavigator = Object.create(navigator);
    Object.defineProperty(window, 'navigator', {
      value: newNavigator,
      configurable: false,
      enumerable: false,
      writable: false
    });
  }

  Object.defineProperties(newNavigator, {
    userAgent: {
      value: userAgent,
      configurable: false,
      enumerable: true,
      writable: false
    },
  });
};

const script = document.createElement('script');
script.textContent = `(${changeUserAgent})()`;
document.documentElement.appendChild(script);
