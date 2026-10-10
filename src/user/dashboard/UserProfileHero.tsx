import { useCurrentStateAndParams } from '@uirouter/react';
import { FC, useMemo } from 'react';
import { User } from 'waldur-js-client';

import { TabNav } from 'waldur-ui';

import { Link } from '@/core/Link';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { isDescendantOf } from '@/navigation/useTabs';

import { UsersService } from '../UsersService';

import { UserProfile } from './UserProfile';

interface UserProfileHeroProps {
  user: User;
  refetch?;
  isLoading?;
  error?;
}

export const UserProfileHero: FC<UserProfileHeroProps> = ({
  user,
  refetch,
  isLoading,
  error,
}) => {
  const { state } = useCurrentStateAndParams();

  const isValidUser = useMemo(
    () =>
      (user &&
        !UsersService.mandatoryFieldsMissing(user) &&
        Boolean(user.agreement_date)) ||
      user?.is_staff,
    [user],
  );

  const showViewTab = isDescendantOf('profile', state);
  const editActive = state.name === 'profile-manage' || !showViewTab;

  const disabledReason = !user?.agreement_date
    ? translate('Terms of service not accepted')
    : translate('Profile is incomplete');

  return isLoading ? (
    <LoadingSpinner />
  ) : error ? (
    <LoadingErred loadData={refetch} />
  ) : (
    <div className="container-fluid my-5">
      <TabNav
        listClassName="mb-4"
        activeKey={editActive ? 'edit' : 'view'}
        items={[
          ...(showViewTab
            ? [
                {
                  key: 'view',
                  title: translate('View'),
                  link: <Link state="profile.details" />,
                  className: 'text-center min-w-60px',
                  disabled: !isValidUser,
                  tooltip: isValidUser ? undefined : disabledReason,
                },
              ]
            : []),
          {
            key: 'edit',
            title: translate('Edit'),
            link: <Link state="profile-manage" />,
            className: 'text-center min-w-60px',
          },
        ]}
      />
      <UserProfile user={user} />
    </div>
  );
};
