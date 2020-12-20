import DOMPurify from 'dompurify';
import React from 'react';

import { formatJiraMarkup } from '@waldur/issues/comments/utils';

export const FormattedJira: React.FC<{ text: string }> = (props) => {
  const html = React.useMemo(
    () => DOMPurify.sanitize(formatJiraMarkup(props.text)),
    [props.text],
  );
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
};
