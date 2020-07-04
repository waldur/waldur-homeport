import { useCurrentStateAndParams } from '@uirouter/react';
import * as React from 'react';
import useEffectOnce from 'react-use/lib/useEffectOnce';

import { $state } from '@waldur/core/services';
import { translate } from '@waldur/i18n';
import { setBreadcrumbs } from '@waldur/navigation/breadcrumbs/store';
import { Layout } from '@waldur/navigation/Layout';
import store from '@waldur/store/store';
import { setCurrentWorkspace, setCurrentUser } from '@waldur/workspace/actions';
import { USER_WORKSPACE } from '@waldur/workspace/types';

import { UserSidebar } from './UserSidebar';
import { UsersService } from './UsersService';

function loadUser() {
  UsersService.getCurrentUser().then(function (user) {
    if ($state.params.uuid === undefined || $state.params.uuid === user.uuid) {
      store.dispatch(setCurrentWorkspace(USER_WORKSPACE));
      store.dispatch(setCurrentUser(user));
      store.dispatch(setBreadcrumbs([{ label: translate('User dashboard') }]));
    } else {
      UsersService.get($state.params.uuid)
        .then(function (user) {
          store.dispatch(setCurrentUser(user));
          store.dispatch(setCurrentWorkspace(USER_WORKSPACE));
          store.dispatch(setBreadcrumbs([{ label: user.full_name }]));
        })
        .catch(function (response) {
          if (response.status === 404) {
            $state.go('errorPage.notFound');
          }
        });
    }
  });
}

export const UserDetails = () => {
  const [pageClass, setPageClass] = React.useState<string>();
  const [hideBreadcrumbs, setHideBreadcrumbs] = React.useState<boolean>();
  const { state, params } = useCurrentStateAndParams();

  function refreshState() {
    const data = state?.data;
    setPageClass(data?.pageClass);
    setHideBreadcrumbs(data?.hideBreadcrumbs);
  }

  useEffectOnce(() => {
    loadUser();
  });
  React.useEffect(refreshState, [state, params]);

  return (
    <Layout
      sidebar={<UserSidebar />}
      pageClass={pageClass}
      hideBreadcrumbs={hideBreadcrumbs}
    />
  );
};
