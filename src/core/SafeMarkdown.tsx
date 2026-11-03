import classNames from 'classnames';
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
      className={classNames('md-content rich-text', {
        'md-small-titles': props.smallTitles,
      })}
      dangerouslySetInnerHTML={{ __html: html }}
      data-testid="safe-markdown"
    />
  );
};
