import React from 'react';

import { sanitizeHtml } from './sanitize';

/**
 * Renders server-supplied HTML safely.
 * Uses the shared DOMPurify allowlist from sanitize.ts.
 *
 * Pipeline: raw HTML → DOMPurify (PURIFY_CONFIG) → dangerouslySetInnerHTML
 */
export const FormattedHtml: React.FC<{ html: string }> = (props) => {
  const html = React.useMemo(() => sanitizeHtml(props.html), [props.html]);
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
};
