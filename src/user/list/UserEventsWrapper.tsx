import * as React from 'react';

import { translate } from '@waldur/i18n';
import { useTitle } from '@waldur/navigation/title';
import { CurrentUserEvents } from '@waldur/user/list/CurrentUserEvents';

export const UserEventsWrapper = () => {
  useTitle(translate('Audit logs'));
  return <CurrentUserEvents />;
};
