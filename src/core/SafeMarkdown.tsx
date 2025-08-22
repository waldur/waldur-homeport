import DOMPurify from 'dompurify';
import Markdown from 'markdown-to-jsx';
import React from 'react';

import './SafeMarkdown.scss';

export const SafeMarkdown: React.FC<{ text: string; smallTitles?: boolean }> = (
  props,
) => {
  const html = React.useMemo(
    () => DOMPurify.sanitize(props.text),
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
