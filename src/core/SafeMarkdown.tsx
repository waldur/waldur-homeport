import DOMPurify from 'dompurify';
import Markdown from 'markdown-to-jsx';
import React from 'react';

export const SafeMarkdown: React.FC<{ text: string }> = (props) => {
  const html = React.useMemo(
    () => DOMPurify.sanitize(props.text),
    [props.text],
  );
  return <Markdown>{html}</Markdown>;
};
