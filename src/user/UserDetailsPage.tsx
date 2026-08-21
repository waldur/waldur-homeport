import { UIView, useCurrentStateAndParams } from '@uirouter/react';
import { FunctionComponent } from 'react';
import { useEffectOnce } from 'react-use';
import { usersRetrieve } from 'waldur-js-client';

import { goToNotFound } from '@/error/utils';
import { usePageHero } from '@/navigation/context';
import { useSetUser, useUser } from '@/workspace/hooks';

import { UserProfileHero } from './dashboard/UserProfileHero';

const WithHero = () => {
  const user = useUser();
  const { state } = useCurrentStateAndParams();

  usePageHero(<UserProfileHero user={user} isLoading={!user} />, [user, state]);

  return <UIView />;
};

export const UserDetailsPage: FunctionComponent = () => {
  const { state, params } = useCurrentStateAndParams();
  const currentUser = useUser();
  const setCurrentUser = useSetUser();

  useEffectOnce(() => {
    async function loadUser() {
      if (params.uuid === undefined || params.uuid === currentUser.uuid) {
        setCurrentUser(currentUser);
      } else if (currentUser.is_staff || currentUser.is_support) {
        try {
          const user = await usersRetrieve({
            path: { uuid: params.uuid as string },
          });
          setCurrentUser(user.data);
        } catch (error) {
          if (error.response?.status === 404) {
            goToNotFound();
          }
        }
      } else {
        goToNotFound();
      }
    }
    loadUser();
  });

  if (state.data?.skipHero) {
    return <UIView />;
  }
  return <WithHero />;
};
