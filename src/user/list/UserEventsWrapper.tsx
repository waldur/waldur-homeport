import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';
import { useTitle } from '@waldur/navigation/title';
import { CurrentUserEvents } from '@waldur/user/list/CurrentUserEvents';

export const UserEventsWrapper: FunctionComponent = () => {
  useTitle(translate('Audit logs'));
  return <CurrentUserEvents />;
};
