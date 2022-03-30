import { FunctionComponent } from 'react';
import { useEffectOnce } from 'react-use';

import { translate } from '@waldur/i18n';
import { setBreadcrumbs } from '@waldur/navigation/breadcrumbs/store';
import { Layout } from '@waldur/navigation/Layout';
import { router } from '@waldur/router';
import store from '@waldur/store/store';
import { setCurrentWorkspace, setCurrentUser } from '@waldur/workspace/actions';
import { USER_WORKSPACE } from '@waldur/workspace/types';

import { UsersService } from './UsersService';

function loadUser() {
  UsersService.getCurrentUser().then(function (currentUser) {
    if (
      router.globals.params.uuid === undefined ||
      router.globals.params.uuid === currentUser.uuid
    ) {
      store.dispatch(setCurrentWorkspace(USER_WORKSPACE));
      store.dispatch(setCurrentUser(currentUser));
      store.dispatch(setBreadcrumbs([{ label: translate('User dashboard') }]));
    } else if (currentUser.is_staff || currentUser.is_support) {
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
    } else {
      router.stateService.go('errorPage.notFound');
    }
  });
}

export const UserDetails: FunctionComponent = () => {
  useEffectOnce(() => {
    loadUser();
  });

  return <Layout />;
};
