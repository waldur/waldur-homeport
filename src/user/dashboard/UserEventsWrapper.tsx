import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';
import { useTitle } from '@waldur/navigation/title';

import { useUserTabs } from '../constants';

import { CurrentUserEvents } from './CurrentUserEvents';

export const UserEventsWrapper: FunctionComponent = () => {
  useTitle(translate('Audit logs'));
  useUserTabs();
  return <CurrentUserEvents />;
};
