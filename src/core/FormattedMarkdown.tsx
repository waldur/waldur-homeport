import DOMPurify from 'dompurify';
import marked from 'marked';
import React from 'react';

export const FormattedMarkdown: React.FC<{ text: string }> = (props) => {
  const html = React.useMemo(() => DOMPurify.sanitize(marked(props.text)), [
    props.text,
  ]);
  return <p dangerouslySetInnerHTML={{ __html: html }} />;
};
