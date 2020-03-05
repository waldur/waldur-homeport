import * as React from 'react';

import { $sanitize } from '@waldur/core/services';

export const TermsOfServiceContent = ({ content }) => {
  const html = React.useMemo(() => $sanitize(content), [content]);
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
};
