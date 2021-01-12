import DOMPurify from 'dompurify';
import React from 'react';

export const FormattedHtml: React.FC<{ html: string }> = (props) => {
  const html = React.useMemo(() => DOMPurify.sanitize(props.html), [
    props.html,
  ]);
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
};
