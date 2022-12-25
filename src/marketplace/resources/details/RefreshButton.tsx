import { useRouter } from '@uirouter/react';
import { useState } from 'react';

import { translate } from '@waldur/i18n';

import { ActionButton } from './ActionButton';

export const RefreshButton = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const reloadState = () => {
    setLoading(true);
    router.stateService.reload().finally(() => {
      setLoading(false);
    });
  };

  return (
    <ActionButton
      title={translate('Refresh')}
      iconClass={loading ? 'fa-repeat fa-spin' : 'fa-repeat'}
      action={!loading && reloadState}
    />
  );
};
