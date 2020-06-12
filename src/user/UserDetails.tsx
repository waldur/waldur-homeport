import { useCurrentStateAndParams } from '@uirouter/react';
import * as React from 'react';
import useEffectOnce from 'react-use/lib/useEffectOnce';

import { ngInjector, $state } from '@waldur/core/services';
import { translate } from '@waldur/i18n';
import { setBreadcrumbs } from '@waldur/navigation/breadcrumbs/store';
import { Layout } from '@waldur/navigation/Layout';
import { WOKSPACE_NAMES } from '@waldur/navigation/workspace/constants';
import store from '@waldur/store/store';

import { UserSidebar } from './UserSidebar';
import { UsersService } from './UsersService';

function loadUser() {
  UsersService.getCurrentUser().then(function(user) {
    if ($state.params.uuid === undefined || $state.params.uuid === user.uuid) {
      ngInjector.get('WorkspaceService').setWorkspace({
        hasCustomer: true,
        workspace: WOKSPACE_NAMES.user,
        currentUser: user,
      });
      store.dispatch(setBreadcrumbs([{ label: translate('User dashboard') }]));
    } else {
      UsersService.get($state.params.uuid)
        .then(function(user) {
          ngInjector.get('WorkspaceService').setWorkspace({
            hasCustomer: true,
            workspace: WOKSPACE_NAMES.user,
            currentUser: user,
          });
          store.dispatch(setBreadcrumbs([{ label: user.full_name }]));
        })
        .catch(function(response) {
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
