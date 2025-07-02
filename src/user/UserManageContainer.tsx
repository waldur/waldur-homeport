import { useQuery } from '@tanstack/react-query';
import { UIView, useCurrentStateAndParams } from '@uirouter/react';
import { useMemo } from 'react';
import { usersRetrieve } from 'waldur-js-client';

import { usePermissionView } from '@waldur/auth/PermissionLayout';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { isFeatureVisible } from '@waldur/features/connect';
import { UserFeatures } from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';
import { useBreadcrumbs, usePageHero } from '@waldur/navigation/context';
import { IBreadcrumbItem, PageBarTab } from '@waldur/navigation/types';
import { usePageTabsTransmitter } from '@waldur/navigation/usePageTabsTransmitter';
import { UserProfileHero } from '@waldur/user/dashboard/UserProfileHero';
import { useUser } from '@waldur/workspace/hooks';

import { CompleteYourProfileBanner } from './CompleteYourProfileBanner';
import { UsersService } from './UsersService';

const UserDetailsTable = lazyComponent(() =>
  import('@waldur/user/support/UserDetailsTable').then((module) => ({
    default: module.UserDetailsTable,
  })),
);
const UserEditTab = lazyComponent(() =>
  import('@waldur/user/support/UserEditTab').then((module) => ({
    default: module.UserEditTab,
  })),
);
const UserTermination = lazyComponent(() =>
  import('@waldur/user/support/UserTermination').then((module) => ({
    default: module.UserTermination,
  })),
);
const UserDeleteAccount = lazyComponent(() =>
  import('@waldur/user/support/UserDeleteAccount').then((module) => ({
    default: module.UserDeleteAccount,
  })),
);

const NotAllowedTab = () => (
  <p className="text-muted text-center">{translate('Not allowed')}</p>
);

export const UserManageContainer = ({ isPersonal }) => {
  const {
    params: { user_uuid },
  } = useCurrentStateAndParams();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['User', user_uuid],
    queryFn: () =>
      isPersonal ? null : usersRetrieve({ path: { uuid: user_uuid } }),
    staleTime: 3 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const currentUser = useUser();

  const user = isPersonal ? currentUser : data?.data;

  const breadcrumbItems = useMemo<IBreadcrumbItem[]>(() => {
    return [
      isPersonal
        ? {
            key: 'users-details',
            text: translate('User'),
            to: 'profile.details',
          }
        : {
            key: 'users',
            text: translate('Users'),
            to: 'admin-user-users',
          },
      {
        key: 'user',
        text: user?.full_name || '...',
        maxLength: 30,
        active: true,
      },
      {
        key: 'manage',
        text: translate('Manage'),
        active: true,
      },
    ];
  }, [user, isPersonal]);

  useBreadcrumbs(breadcrumbItems);

  const isValidUser = useMemo(
    () =>
      user &&
      !UsersService.mandatoryFieldsMissing(user) &&
      Boolean(user.agreement_date),
    [user],
  );

  const tabs = useMemo<PageBarTab[]>(
    () =>
      [
        (currentUser.is_staff || currentUser.is_support || isPersonal) && {
          key: 'user-details',
          component:
            currentUser.is_staff || isPersonal ? UserEditTab : UserDetailsTable,
          title: translate('User profile'),
        },
        (!isFeatureVisible(UserFeatures.disable_user_termination) ||
          currentUser.is_staff) && {
          key: 'termination',
          component: isValidUser
            ? isPersonal
              ? UserDeleteAccount
              : UserTermination
            : NotAllowedTab,
          title: translate('Termination actions'),
          disabled: !isValidUser,
        },
      ].filter(Boolean),
    [user, currentUser, isValidUser],
  );

  const { tabSpec } = usePageTabsTransmitter(tabs);

  usePageHero(
    <UserProfileHero
      user={user}
      isLoading={isLoading}
      refetch={refetch}
      error={error}
    />,

    [user, isLoading, refetch, error],
  );

  usePermissionView(() => {
    if (isPersonal && !isValidUser) {
      return {
        permission: 'custom',
        banner: <CompleteYourProfileBanner />,
      };
    }
    return null;
  }, [isPersonal, isValidUser]);

  if (isLoading) {
    return <LoadingSpinner />;
  } else if (error) {
    return <LoadingErred loadData={refetch} />;
  }

  return (
    <UIView
      render={(Component, { key, ...props }) => (
        <Component key={key} {...props} tabSpec={tabSpec} user={user} />
      )}
    />
  );
};
