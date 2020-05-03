import { escapeHtml } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import { Attachment } from '@waldur/issues/attachments/types';
import { getFileName } from '@waldur/issues/attachments/utils';
import { openModalDialog } from '@waldur/modal/actions';

import { Comment } from './types';

const urlPattern =
  '(?:(?:https?|ftp|file)://|www.|ftp.)(?:([-A-Z0-9+&@#/%=~_|$?!:,.]*)|[-A-Z0-9+&@#/%=~_|$?!:,.])*(?:([-A-Z0-9+&@#/%=~_|$?!:,.]*)|[A-Z0-9+&@#/%=~_|$])';

const urlRegex = new RegExp(urlPattern, 'im');

const standaloneLinkRegex = /\s+(https?:\/\/[^\s]+)\s*/gim;

export const getUrl = (str: string): string => {
  const result = str.match(urlRegex);
  return result ? result[0] : null;
};

export const createJiraComment = (
  message: string,
  attachments: Attachment[] = [],
): string => {
  let comment = message || '';

  if (!attachments.length) {
    return comment;
  }

  for (const attachment of attachments) {
    const fileName = getFileName(attachment.file);
    const jiraMarkup = /^image/.test(attachment.mime_type)
      ? `!${fileName}|thumbnail!`
      : `[^${fileName}]`;

    comment += comment.length ? `\n${jiraMarkup}` : jiraMarkup;
  }

  return comment;
};

export const commentExist = (
  comments: Comment[],
  commentId: string,
): boolean => {
  for (const comment of comments) {
    if (comment.uuid === commentId) {
      return true;
    }
  }
  return false;
};

export const getAttachmentByFileName = (
  attachments: Attachment[] = [],
  fileName = '',
): Attachment => {
  for (const attachment of attachments) {
    if (getFileName(attachment.file) !== fileName) {
      continue;
    }
    return attachment;
  }
  return null;
};

export const renderLink = (
  href: string,
  name: string = href,
  download = false,
) => `<a href="${href}"${download ? ' download' : ''}>${name}</a>`;

// See also JIRA to Markdown converter: https://github.com/kylefarris/J2M/blob/master/index.js
// and JIRA Text Formatting Notation: https://jira.atlassian.com/secure/WikiRendererHelpAction.jspa?section=all

export const formatJiraMarkup = (
  text = '',
  attachments: Attachment[] = [],
): string =>
  escapeHtml(text)
    // Bold
    .replace(/\*(\S.*)\*/g, '<b>$1</b>')

    // Italic
    .replace(/\b_(\S.*)_\b/g, '<i>$1</i>')

    // Monospaced text
    .replace(/\{\{([^}]+)\}\}/g, '<code>$1</code>')

    // Standalone links
    .replace(standaloneLinkRegex, (_, url) => {
      return ' ' + renderLink(url, url) + ' ';
    })

    // Un-named Links
    .replace(/\[\^?([^|]+)\]/g, (_, fileName) => {
      const url = getUrl(fileName);
      if (url) {
        return renderLink(url);
      }
      const attachment = getAttachmentByFileName(attachments, fileName);
      return attachment
        ? renderLink(attachment.file, fileName, true)
        : `${translate('Unable to find:')} ${fileName}`;
    })

    // Named Links
    .replace(/\[(.+?)\|(.+)\]/g, (_, name, fileName) => {
      const url = getUrl(fileName);
      if (url) {
        return renderLink(url, name);
      }
      const attachment = getAttachmentByFileName(attachments, fileName);
      return attachment
        ? renderLink(attachment.file, name, true)
        : `${translate('Unable to find:')} ${name}`;
    })

    // Images
    .replace(/!(.+)\|thumbnail!/g, (_, fileName) => {
      const attachment = getAttachmentByFileName(attachments, fileName);
      return attachment
        ? `<img src="${attachment.file}" title="${fileName}" />`
        : `${translate('Unable to find:')} ${fileName}`;
    })

    .replace(/\n/g, '<br/>');

export const openUserModal = (uuid: string) =>
  openModalDialog('userPopover', { resolve: { user_uuid: uuid } });
