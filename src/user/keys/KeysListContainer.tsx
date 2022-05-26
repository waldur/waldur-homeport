import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';
import { useTitle } from '@waldur/navigation/title';
import { KeysList } from '@waldur/user/keys/KeysList';

import { useUserTabs } from '../constants';

export const KeysListContainer: FunctionComponent = () => {
  useTitle(translate('SSH keys'));
  useUserTabs();
  return <KeysList />;
};
