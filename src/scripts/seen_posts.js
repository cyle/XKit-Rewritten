import { getPostElements } from '../util/interface.js';
import { givenPath } from '../util/react_props.js';
import { getPreferences } from '../util/preferences.js';
import { onNewPosts } from '../util/mutations.js';

const excludeClass = 'xkit-seen-posts-done';
const dimClass = 'xkit-seen-posts-seen';
const onlyDimAvatarsClass = 'xkit-seen-posts-only-dim-avatar';

const dimPosts = async function () {
  const storageKey = 'seen_posts.seenPosts';
  const { [storageKey]: seenPosts = [] } = await browser.storage.local.get(storageKey);

  for (const postElement of getPostElements({ excludeClass, noPeepr: true, includeFiltered: true })) {
    const timeline = await givenPath(postElement);
    if (timeline !== '/v2/timeline/dashboard') { continue; }

    const { id } = postElement.dataset;

    if (seenPosts.includes(id)) {
      postElement.classList.add(dimClass);
    } else {
      seenPosts.push(id);
    }
  }

  seenPosts.splice(0, seenPosts.length - 10000);

  browser.storage.local.set({ [storageKey]: seenPosts });
};

const onStorageChanged = async function (changes, areaName) {
  if (areaName !== 'local') {
    return;
  }

  const { 'seen_posts.preferences.onlyDimAvatars': onlyDimAvatarsChanges } = changes;

  if (onlyDimAvatarsChanges && onlyDimAvatarsChanges.oldValue !== undefined) {
    const { newValue: onlyDimAvatars } = onlyDimAvatarsChanges;
    const addOrRemove = onlyDimAvatars ? 'add' : 'remove';
    document.body.classList[addOrRemove](onlyDimAvatarsClass);
  }
};

export const main = async function () {
  browser.storage.onChanged.addListener(onStorageChanged);

  const { onlyDimAvatars } = await getPreferences('seen_posts');
  if (onlyDimAvatars) {
    document.body.classList.add(onlyDimAvatarsClass);
  }

  onNewPosts.addListener(dimPosts);
  dimPosts();
};

export const clean = async function () {
  browser.storage.onChanged.removeListener(onStorageChanged);

  onNewPosts.removeListener(dimPosts);
  $(`.${excludeClass}`).removeClass(excludeClass);
  $(`.${dimClass}`).removeClass(dimClass);
  $(`.${onlyDimAvatarsClass}`).removeClass(onlyDimAvatarsClass);
};

export const stylesheet = true;
