// See also JIRA to Markdown converter: https://github.com/kylefarris/J2M/blob/master/index.js
// and JIRA Text Formatting Notation: https://jira.atlassian.com/secure/WikiRendererHelpAction.jspa?section=all

export const formatJiraMarkup = text => (
  text

  // Bold
  .replace(/\*(\S.*)\*/g, '<b>$1</b>')

  // Italic
  .replace(/\_(\S.*)\_/g, '<i>$1</i>')

  // Monospaced text
  .replace(/\{\{([^}]+)\}\}/g, '<code>$1</code>')

  // Un-named Links
  .replace(/\[([^|]+)\]/g, '<a href="$1">$1</a>')

  // Named Links
  .replace(/\[(.+?)\|(.+)\]/g, '<a href="$2">$1</a>')

  .replace(/\n/g, '<br/>')
);

// @ngInject
export default function formatJiraMarkupFilter($sce) {
  return value => $sce.trustAsHtml(formatJiraMarkup(value));
}
