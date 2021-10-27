import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';
import { useTitle } from '@waldur/navigation/title';
import { UserOfferingList } from '@waldur/user/UserOfferingList';

export const UserOfferingListContainer: FunctionComponent = () => {
  useTitle(translate('Remote accounts'));
  return <UserOfferingList />;
};
