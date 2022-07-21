import DOMPurify from 'dompurify';
import React from 'react';

export const TextWithoutFormatting: React.FC<{ html: string }> = (props) => {
  const text = React.useMemo(
    () => DOMPurify.sanitize(props.html, { ALLOWED_TAGS: ['#text'] }),
    [props.html],
  );
  return <>{text}</>;
};
