import { UIView, useCurrentStateAndParams } from '@uirouter/react';
import { FunctionComponent } from 'react';
import { useEffectOnce } from 'react-use';
import { usersRetrieve } from 'waldur-js-client';

import { usePageHero } from '@/navigation/context';
import { router } from '@/router';
import store from '@/store/store';
import { setCurrentUser } from '@/workspace/actions';
import { useUser } from '@/workspace/hooks';
import { getUser } from '@/workspace/selectors';

import { UserProfileHero } from './dashboard/UserProfileHero';

async function loadUser() {
  const currentUser = getUser(store.getState());
  if (
    router.globals.params.uuid === undefined ||
    router.globals.params.uuid === currentUser.uuid
  ) {
    store.dispatch(setCurrentUser(currentUser));
  } else if (currentUser.is_staff || currentUser.is_support) {
    try {
      const user = await usersRetrieve({
        path: { uuid: router.globals.params.uuid },
      });
      store.dispatch(setCurrentUser(user.data));
    } catch (error) {
      if (error.response?.status === 404) {
        router.stateService.go('errorPage.notFound');
      }
    }
  } else {
    router.stateService.go('errorPage.notFound');
  }
}

const WithHero = () => {
  const user = useUser();
  const { state } = useCurrentStateAndParams();

  usePageHero(<UserProfileHero user={user} isLoading={!user} />, [user, state]);

  return <UIView />;
};

export const UserDetailsPage: FunctionComponent = () => {
  const { state } = useCurrentStateAndParams();

  useEffectOnce(() => {
    loadUser();
  });

  if (state.data?.skipHero) {
    return <UIView />;
  }
  return <WithHero />;
};
