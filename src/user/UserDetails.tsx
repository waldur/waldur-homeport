import { useCurrentStateAndParams } from '@uirouter/react';
import { useState, useEffect, FunctionComponent } from 'react';
import { useEffectOnce } from 'react-use';

import { translate } from '@waldur/i18n';
import { setBreadcrumbs } from '@waldur/navigation/breadcrumbs/store';
import { Layout } from '@waldur/navigation/Layout';
import { router } from '@waldur/router';
import store from '@waldur/store/store';
import { setCurrentWorkspace, setCurrentUser } from '@waldur/workspace/actions';
import { USER_WORKSPACE } from '@waldur/workspace/types';

import { UserSidebar } from './UserSidebar';
import { UsersService } from './UsersService';

function loadUser() {
  UsersService.getCurrentUser().then(function (user) {
    if (
      router.globals.params.uuid === undefined ||
      router.globals.params.uuid === user.uuid
    ) {
      store.dispatch(setCurrentWorkspace(USER_WORKSPACE));
      store.dispatch(setCurrentUser(user));
      store.dispatch(setBreadcrumbs([{ label: translate('User dashboard') }]));
    } else {
      UsersService.get(router.globals.params.uuid)
        .then(function (user) {
          store.dispatch(setCurrentUser(user));
          store.dispatch(setCurrentWorkspace(USER_WORKSPACE));
          store.dispatch(setBreadcrumbs([{ label: user.full_name }]));
        })
        .catch(function (response) {
          if (response.status === 404) {
            router.stateService.go('errorPage.notFound');
          }
        });
    }
  });
}

export const UserDetails: FunctionComponent = () => {
  const [pageClass, setPageClass] = useState<string>();
  const [hideBreadcrumbs, setHideBreadcrumbs] = useState<boolean>();
  const { state, params } = useCurrentStateAndParams();

  function refreshState() {
    const data = state?.data;
    setPageClass(data?.pageClass);
    setHideBreadcrumbs(data?.hideBreadcrumbs);
  }

  useEffectOnce(() => {
    loadUser();
  });
  useEffect(refreshState, [state, params]);

  return (
    <Layout
      sidebar={<UserSidebar />}
      pageClass={pageClass}
      hideBreadcrumbs={hideBreadcrumbs}
    />
  );
};
