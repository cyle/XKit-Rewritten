import { getPostElements } from '../util/interface.js';
import { timelineObjectMemoized, givenPath } from '../util/react_props.js';
import { getPreferences } from '../util/preferences.js';
import { onNewPosts } from '../util/mutations.js';

const excludeClass = 'xkit-show-originals-done';
const hiddenClass = 'xkit-show-originals-hidden';

let showOwnReblogs;
let showReblogsWithContributedContent;
let whitelistedUsernames;

const processPosts = async function () {
  const whitelist = whitelistedUsernames.split(',').map(username => username.trim());

  getPostElements({ excludeClass, includeFiltered: true }).forEach(async postElement => {
    const timeline = await givenPath(postElement);
    if (timeline !== '/v2/timeline/dashboard') { return; }

    const { rebloggedRootId, canEdit, content, blogName } = await timelineObjectMemoized(postElement.dataset.id);

    if (!rebloggedRootId) {
      return;
    }

    if (showOwnReblogs && canEdit) {
      return;
    }

    if (showReblogsWithContributedContent && content.length > 0) {
      return;
    }

    if (whitelist.includes(blogName)) {
      return;
    }

    postElement.classList.add(hiddenClass);
  });
};

export const main = async function () {
  ({ showOwnReblogs, showReblogsWithContributedContent, whitelistedUsernames } = await getPreferences('show_originals'));

  onNewPosts.addListener(processPosts);
  processPosts();
};

export const clean = async function () {
  onNewPosts.removeListener(processPosts);

  $(`.${excludeClass}`).removeClass(excludeClass);
  $(`.${hiddenClass}`).removeClass(hiddenClass);
};

export const stylesheet = true;
export const autoRestart = true;
