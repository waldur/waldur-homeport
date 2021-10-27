import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';
import { useTitle } from '@waldur/navigation/title';
import { KeysList } from '@waldur/user/keys/KeysList';

export const KeysListContainer: FunctionComponent = () => {
  useTitle(translate('SSH keys'));
  return <KeysList />;
};
