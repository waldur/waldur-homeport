import marked from 'marked';
import * as React from 'react';

import { $sanitize } from '@waldur/core/services';

export const FormattedMarkdown = props => {
  const html = React.useMemo(() => $sanitize(marked(props.text)), []);
  return <p dangerouslySetInnerHTML={{ __html: html }} />;
};
