import { FunctionComponent } from 'react';

import {} from 'waldur-ui';

import { translate } from '@/i18n';
import { NavMenuLink } from '@/navigation/NavMenu';

/**
 * Link's own onClick drives the uirouter transition, and Radix closes the
 * menu on selection by default, so no onSelect is needed.
 */
export const LogoutMenuItem: FunctionComponent = () => (
  <NavMenuLink state="logout" label={translate('Log out')} />
);
