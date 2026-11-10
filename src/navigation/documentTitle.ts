// The page title and the unread chat count arrive from unrelated places, so
// both are kept here and every write puts them together: navigating must not
// drop the count, and a new count must not drop the page title.
let currentBase = '';
let currentUnread = 0;

export const formatDocumentTitle = (base: string, unread: number) => {
  if (unread <= 0) {
    return base;
  }
  return `(${unread > 99 ? '99+' : unread}) ${base}`;
};

const write = () => {
  document.title = formatDocumentTitle(currentBase, currentUnread);
};

/** The page title without the unread prefix, for analytics. */
export const getDocumentTitleBase = () => currentBase;

export const setDocumentTitle = (base: string) => {
  currentBase = base;
  write();
};

export const setDocumentTitleUnread = (unread: number) => {
  currentUnread = unread;
  write();
};
