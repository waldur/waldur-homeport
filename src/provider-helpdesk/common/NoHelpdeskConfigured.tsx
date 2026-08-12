import { useRouter } from '@uirouter/react';
import { FC } from 'react';

import { translate } from '@/i18n';
import { NoResult } from '@/navigation/header/search/NoResult';

/** Empty state shown on provider-helpdesk pages when no helpdesk exists yet. */
export const NoHelpdeskConfigured: FC = () => {
  const router = useRouter();
  return (
    <NoResult
      title={translate('No helpdesk configured')}
      message={translate(
        'This provider does not have a helpdesk yet. A Waldur administrator can register one to start receiving routed tickets.',
      )}
      buttonTitle={translate('Go to configuration')}
      callback={() => router.stateService.go('provider-helpdesk-configuration')}
    />
  );
};
