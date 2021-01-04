import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

import { translate } from '@waldur/i18n';
import { getConfig } from '@waldur/store/config';
import { RootState } from '@waldur/store/reducers';

export const DocsLink: FunctionComponent = () => {
  const link = useSelector((state: RootState) => getConfig(state).docsLink);
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
