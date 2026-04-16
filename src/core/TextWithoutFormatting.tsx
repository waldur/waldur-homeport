import React from 'react';

import { stripHtml } from './sanitize';

export const TextWithoutFormatting: React.FC<{ html: string }> = (props) => {
  const text = React.useMemo(() => stripHtml(props.html), [props.html]);
  return <>{text}</>;
};
