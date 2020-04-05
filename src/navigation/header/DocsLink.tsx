import * as React from 'react';
import { useSelector } from 'react-redux';

import { translate } from '@waldur/i18n';
import { getConfig } from '@waldur/store/config';

export const DocsLink = () => {
  const link = useSelector(state => getConfig(state).docsLink);
  if (!link) {
    return null;
  }
  return (
    <li>
      <a href={link} target="_blank" rel="noopener noreferrer">
        {translate('Documentation')}
      </a>
    </li>
  );
};
