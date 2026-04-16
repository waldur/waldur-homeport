import { escapeHtml } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import { Attachment } from '@waldur/issues/attachments/types';

// Simplified URL pattern to avoid catastrophic backtracking
// Matches URLs starting with http://, https://, or www.
const urlPattern = '(?:https?://|www\\.)[^\\s\\]|]+';

const urlRegex = new RegExp(urlPattern, 'i');

const standaloneLinkRegex = /\s+(https?:\/\/[^\s]+)\s*/gim;

export const getUrl = (str: string): string => {
  const result = str.match(urlRegex);
  return result ? result[0] : null;
};

const getAttachmentByFileName = (
  attachments: Attachment[] = [],
  fileName = '',
): Attachment => {
  for (const attachment of attachments) {
    if (attachment.file_name !== fileName) {
      continue;
    }
    return attachment;
  }
  return null;
};

/**
 * Escapes a string for safe use inside an HTML attribute value delimited by double-quotes.
 * escapeHtml() only covers < and >, which is insufficient for attribute contexts
 * where an unescaped " would break out of the surrounding quotes.
 */
const escapeAttr = (value: string): string => value.replace(/"/g, '&quot;');

const renderLink = (href: string, name: string = href, download = false) =>
  `<a href="${escapeAttr(href)}"${download ? ' download' : ''}>${escapeAttr(name)}</a>`;

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
