import React from 'react';

import { parseMarkdown } from './sanitize';
import './SafeMarkdown.scss';

/**
 * Renders user-supplied Markdown safely.
 *
 * Pipeline: markdown → marked → DOMPurify (PURIFY_CONFIG) → dangerouslySetInnerHTML
 * See sanitize.ts for the shared config and rationale.
 */
export const SafeMarkdown: React.FC<{ text: string; smallTitles?: boolean }> = (
  props,
) => {
  const html = React.useMemo(() => parseMarkdown(props.text), [props.text]);

  return (
    <div
      className={'md-content' + (props.smallTitles ? ' md-small-titles' : '')}
      dangerouslySetInnerHTML={{ __html: html }}
      data-testid="safe-markdown"
    />
  );
};
