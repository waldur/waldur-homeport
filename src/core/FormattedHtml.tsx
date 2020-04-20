import * as React from 'react';

import { $sanitize } from '@waldur/core/services';

export const FormattedHtml: React.FC<{ html: string }> = props => {
  const html = React.useMemo(() => $sanitize(props.html), [props.html]);
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
};
