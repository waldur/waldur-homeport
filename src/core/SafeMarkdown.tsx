import DOMPurify from 'dompurify';
import Markdown from 'markdown-to-jsx';
import React from 'react';

import './SafeMarkdown.scss';

const decodeHtmlEntities = (value: string): string => {
  if (typeof document === 'undefined') {
    return value;
  }

  const textarea = document.createElement('textarea');
  textarea.innerHTML = value;
  return textarea.value;
};

export const SafeMarkdown: React.FC<{ text: string; smallTitles?: boolean }> = (
  props,
) => {
  const html = React.useMemo(
    () => DOMPurify.sanitize(decodeHtmlEntities(props.text)),
    [props.text],
  );
  return (
    <Markdown
      className={
        'md-content' + (props.smallTitles ? ' md-small-titles' : undefined)
      }
    >
      {html}
    </Markdown>
  );
};
