import React from 'react';

import { formatJiraMarkup } from '@waldur/issues/comments/utils';

import { sanitizeHtml } from './sanitize';

/**
 * Renders Jira-formatted text as safe HTML.
 * Uses the shared DOMPurify allowlist from sanitize.ts.
 *
 * Pipeline: Jira markup → formatJiraMarkup (HTML string) → DOMPurify (PURIFY_CONFIG) → dangerouslySetInnerHTML
 */
export const FormattedJira: React.FC<{ text: string }> = (props) => {
  const html = React.useMemo(
    () => sanitizeHtml(formatJiraMarkup(props.text)),
    [props.text],
  );
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
};
