const browser = chrome || browser;

let settings = {
  addUsername: false,
  separator: '_'
};

const updatePopup = () => {
  const { addUsername, separator } = settings;
  addUsernameCheckbox.checked = addUsername;
  separatorInput.value = separator
  return addUsername ? separatorField.classList.remove('instab-hide') : separatorField.classList.add('instab-hide');
};

const setFields = (result) => {
  const { instabSettings } = result || {};
  settings = instabSettings || settings;
  updatePopup();
};

const updateFields = (result) => {
  const { instabSettings } = result || {};
  const { newValue } = instabSettings || {};
  settings = newValue || settings;
  updatePopup();
};

const updateSettings = (e) => {
  const { name, type, checked, value } = e.currentTarget;

  const updatedSettings = {
    ...settings,
    [name]: type === 'checkbox' ? checked : value
  };

  browser.storage.sync.set({ instabSettings: updatedSettings });
};

browser.storage.sync.get('instabSettings', setFields);
browser.storage.onChanged.addListener(updateFields);

const addUsernameCheckbox = document.querySelector('.instab-popup__checkbox');
const separatorInput = document.querySelector('.instab-popup__input-separator');
const separatorField = document.querySelector('.instab-popup__field-separator');

addUsernameCheckbox.addEventListener('change', updateSettings);
separatorInput.addEventListener('change', updateSettings);