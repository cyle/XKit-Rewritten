import { buildStyle, filterPostElements, postSelector } from '../util/interface.js';
import { onNewPosts } from '../util/mutations.js';
import { getPreferences } from '../util/preferences.js';
import { keyToCss } from '../util/css_map.js';
import { dom } from '../util/dom.js';

let showTags;
let maxHeight;

let tagsSelector;

const excludeClass = 'xkit-shorten-posts-done';
const noPeepr = true;

const shortenClass = 'xkit-shorten-posts-shortened';
const tagsClass = 'xkit-shorten-posts-tags';
const buttonClass = 'xkit-shorten-posts-expand';

const styleElement = buildStyle();
const expandButton = dom('button', { class: buttonClass }, null, ['Expand']);

const unshortenOnClick = ({ currentTarget }) => {
  const postElement = currentTarget.closest(postSelector);
  if (postElement.classList.contains(shortenClass) === false) {
    return;
  }

  document.documentElement.style.overflowAnchor = 'none';
  postElement.classList.remove(shortenClass);
  document.documentElement.style.overflowAnchor = '';

  const tagsClone = postElement.querySelector(`.${tagsClass}`);
  tagsClone?.remove();

  currentTarget.remove();
};

const shortenPosts = postElements => filterPostElements(postElements, { excludeClass, noPeepr }).forEach(postElement => {
  if (postElement.getBoundingClientRect().height > (window.innerHeight * maxHeight)) {
    postElement.classList.add(shortenClass);

    if (showTags) {
      const tagsElement = postElement.querySelector(tagsSelector);
      if (tagsElement) {
        const tagsClone = tagsElement.cloneNode(true);
        tagsClone.classList.add(tagsClass);
        [...tagsClone.querySelectorAll('[href]')].forEach(element => { element.target = '_blank'; });
        postElement.querySelector('article')?.appendChild(tagsClone);
      }
    }

    const expandButtonClone = expandButton.cloneNode(true);
    expandButtonClone.addEventListener('click', unshortenOnClick);
    postElement.querySelector('article')?.appendChild(expandButtonClone);
  }
});

export const main = async function () {
  ({ showTags, maxHeight } = await getPreferences('shorten_posts'));

  styleElement.textContent = `body { --xkit-shorten-posts-max-height: ${maxHeight}; }`;
  document.head.append(styleElement);

  tagsSelector = await keyToCss('tags');

  onNewPosts.addListener(shortenPosts);
};

export const clean = async function () {
  onNewPosts.removeListener(shortenPosts);

  styleElement.remove();

  $(`.${excludeClass}`).removeClass(excludeClass);
  $(`.${shortenClass}`).removeClass(shortenClass);
  $(`.${tagsClass}, .${buttonClass}`).remove();
};

export const stylesheet = true;
