import { FunctionComponent } from 'react';
import { useAsyncFn, useEffectOnce } from 'react-use';
import {
  freeipaProfilesList,
  FreeipaProfile,
  usersRetrieve,
} from 'waldur-js-client';

import { ENV } from '@/core/config';

import { UserDetailsDialog } from './support/UserDetailsDialog';

export const UserPopover: FunctionComponent<{ resolve }> = ({ resolve }) => {
  const [{ loading, error, value }, callback] = useAsyncFn(async () => {
    let user;
    if (resolve.user_uuid) {
      user = (await usersRetrieve({ path: { uuid: resolve.user_uuid } })).data;
    } else {
      user = resolve.user;
    }
    let profile: FreeipaProfile = null;
    if (ENV.plugins.WALDUR_CORE.FREEIPA_ENABLED) {
      profile = await freeipaProfilesList({ query: { user: user.uuid } }).then(
        (r) => r.data[0],
      );
    }
    return { user, profile };
  }, [resolve]);

  useEffectOnce(() => {
    callback();
  });

  return (
    <UserDetailsDialog
      resolve={{
        user: value?.user,
        loading,
        error,
        refetch: callback,
      }}
    />
  );
};
