/**
 * Shared HTML sanitisation helpers.
 *
 * All user-supplied content that eventually ends up in the DOM via
 * `dangerouslySetInnerHTML` MUST be processed through one of the
 * functions in this module.
 *
 * Rule of thumb:
 *  - Raw HTML from the server               → sanitizeHtml()
 *  - Markdown from the server               → parseMarkdown() / parseMarkdownInline()
 *  - Markdown, links only (announcement bar) → parseMarkdownLinksOnly()
 *  - Strip all tags, keep text              → stripHtml()
 */

import DOMPurify, { type Config as DOMPurifyConfig } from 'dompurify';
import { marked } from 'marked';

/** HTML tags that are safe to render in user-authored content. */
const ALLOWED_TAGS = [
  'p',
  'br',
  'strong',
  'em',
  'b',
  'i',
  'ul',
  'ol',
  'li',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'a',
  'code',
  'pre',
  'blockquote',
  'hr',
  'table',
  'thead',
  'tbody',
  'tr',
  'th',
  'td',
  'img',
];

/**
 * Allowed attributes.
 * - `data-*` excluded to prevent framework attribute hijacking.
 * - Event handlers (`onclick`, etc.) are blocked by DOMPurify by default.
 */
const ALLOWED_ATTR = ['href', 'src', 'title', 'alt', 'class', 'download'];

/**
 * Only allow safe URL schemes.
 * Blocks `javascript:`, `data:`, `vbscript:`, and any other arbitrary scheme.
 */
const ALLOWED_URI_REGEXP =
  /^(?:(?:https?|mailto|ftp):|[^a-zA-Z]|[a-zA-Z][^:]*$)/i;

const PURIFY_CONFIG: DOMPurifyConfig = {
  ALLOWED_TAGS,
  ALLOWED_ATTR,
  ALLOW_DATA_ATTR: false,
  ALLOWED_URI_REGEXP,
};

/**
 * Sanitize an HTML string against the shared allowlist.
 * Use when the input is already HTML (e.g. from a rich-text API field).
 *
 * Pipeline: raw HTML → DOMPurify → safe HTML string
 */
export const sanitizeHtml = (html: string): string =>
  DOMPurify.sanitize(html, PURIFY_CONFIG);

/**
 * Convert a Markdown string to safe HTML.
 * Use for block-level content (paragraphs, headings, lists, etc.).
 *
 * Pipeline: markdown → marked (HTML string) → DOMPurify → safe HTML string
 *
 * DOMPurify intentionally runs *after* marked so that it inspects the
 * final HTML structure, including any URLs that the markdown→HTML step
 * may have introduced.
 */
export const parseMarkdown = (markdown: string): string =>
  sanitizeHtml(marked.parse(markdown, { async: false }) as string);

/**
 * Shared configuration for stripping all formatting except links.
 */
const LINKS_ONLY_PURIFY_CONFIG: DOMPurifyConfig = {
  ...PURIFY_CONFIG,
  ALLOWED_TAGS: ['a'],
};

/**
 * Convert a Markdown string to safe HTML, preserving ONLY links.
 * All other formatting (bold, italic, headers, etc.) is stripped.
 *
 * Pipeline: markdown → marked.parseInline → DOMPurify (links-only) → safe HTML string
 */
export const parseMarkdownLinksOnly = (markdown: string): string =>
  DOMPurify.sanitize(
    marked.parseInline(markdown, { async: false }) as string,
    LINKS_ONLY_PURIFY_CONFIG,
  );

/**
 * Strips all HTML tags from a string, preserving only the text content.
 *
 * Pipeline: raw HTML → DOMPurify (text-only) → plain text string
 */
export const stripHtml = (html: string): string =>
  DOMPurify.sanitize(html, { ALLOWED_TAGS: ['#text'] });
