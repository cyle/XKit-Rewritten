import { getPreferences } from '../util/preferences.js';
import { translate } from '../util/language_data.js';
import { buildStyle } from '../util/interface.js';

const styleElement = buildStyle();

export const main = async function () {
  const avatarText = await translate('Avatar');

  const { hiddenAvatars } = await getPreferences('hide_avatars');

  styleElement.textContent = hiddenAvatars
    .split(',')
    .map(username => `[title="${username.trim()}"] img[alt="${avatarText}"] { display: none; }`)
    .join('\n');

  document.head.append(styleElement);
};

export const clean = async function () {
  styleElement.remove();
};
