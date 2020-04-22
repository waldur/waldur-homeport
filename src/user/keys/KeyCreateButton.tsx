import { useRouter } from '@uirouter/react';
import * as React from 'react';

import { translate } from '@waldur/i18n/translate';
import { ActionButton } from '@waldur/table-react/ActionButton';

export const KeyCreateButton = () => {
  const router = useRouter();

  return (
    <ActionButton
      title={translate('Add key')}
      action={() => router.stateService.go('keys.create')}
      icon="fa fa-plus"
    />
  );
};
