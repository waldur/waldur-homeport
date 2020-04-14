import * as React from 'react';

import { $sanitize } from '@waldur/core/services';
import { formatJiraMarkup } from '@waldur/issues/comments/utils';

export const FormattedJira: React.FC<{ text: string }> = props => {
  const html = React.useMemo(() => $sanitize(formatJiraMarkup(props.text)), [
    props.text,
  ]);
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
};
