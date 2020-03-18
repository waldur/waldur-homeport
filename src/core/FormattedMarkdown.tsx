import marked from 'marked';
import * as React from 'react';

import { $sanitize } from '@waldur/core/services';

export const FormattedMarkdown: React.FC<{ text: string }> = props => {
  const html = React.useMemo(() => $sanitize(marked(props.text)), [props.text]);
  return <p dangerouslySetInnerHTML={{ __html: html }} />;
};
