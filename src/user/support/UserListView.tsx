import { useRouter } from '@uirouter/react';
import { FunctionComponent } from 'react';

import { ENV } from '@waldur/configs/default';
import { translate } from '@waldur/i18n';
import { useTitle } from '@waldur/navigation/title';

import { UserFilter } from './UserFilter';
import { UserList } from './UserList';

export const UserListView: FunctionComponent = () => {
  useTitle(translate('Users'));
  const router = useRouter();
  if (!ENV.FEATURES.SUPPORT.USERS) {
    router.stateService.go('errorPage.notFound');
  }
  return (
    <>
      <div className="ibox-content m-b-sm border-bottom">
        <UserFilter />
      </div>
      <div className="ibox-content">
        <UserList />
      </div>
    </>
  );
};
