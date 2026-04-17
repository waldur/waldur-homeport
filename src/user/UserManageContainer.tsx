import { useQuery } from '@tanstack/react-query';
import { UIView, useCurrentStateAndParams } from '@uirouter/react';
import { useMemo } from 'react';
import { usersRetrieve } from 'waldur-js-client';

import { usePermissionView } from '@waldur/auth/PermissionLayout';
import { UI_STALE_TIME } from '@waldur/core/constants';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { isFeatureVisible } from '@waldur/features/connect';
import { MarketplaceFeatures, UserFeatures } from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';
import { useBreadcrumbs, usePageHero } from '@waldur/navigation/context';
import { IBreadcrumbItem, PageBarTab } from '@waldur/navigation/types';
import { usePageTabsTransmitter } from '@waldur/navigation/usePageTabsTransmitter';
import { UserProfileHero } from '@waldur/user/dashboard/UserProfileHero';
import { useUser } from '@waldur/workspace/hooks';

import { CompleteYourProfileBanner } from './CompleteYourProfileBanner';
import { useProfileCompleteness } from './useProfileCompleteness';

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
const UserEvents = lazyComponent(() =>
  import('@waldur/user/dashboard/UserEvents').then((module) => ({
    default: module.UserEvents,
  })),
);
const KeysList = lazyComponent(() =>
  import('@waldur/user/keys/KeysList').then((module) => ({
    default: module.KeysList,
  })),
);
const UserOfferingList = lazyComponent(() =>
  import('@waldur/user/UserOfferingList').then((module) => ({
    default: module.UserOfferingList,
  })),
);
const UserAffiliationsList = lazyComponent(() =>
  import('@waldur/user/affiliations/UserAffiliationsList').then((module) => ({
    default: module.UserAffiliationsList,
  })),
);
const ReviewerProfileTab = lazyComponent(() =>
  import('@waldur/user/ReviewerProfileTab').then((module) => ({
    default: module.ReviewerProfileTab,
  })),
);
const DataAccessTab = lazyComponent(() =>
  import('@waldur/user/data-access/DataAccessTab').then((module) => ({
    default: module.DataAccessTab,
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
    staleTime: UI_STALE_TIME,
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

  const profileCompleteness = useProfileCompleteness(user);

  const isValidUser = useMemo(
    () =>
      user && profileCompleteness?.is_complete && Boolean(user.agreement_date),
    [user, profileCompleteness],
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
        // Reviewer profile - only for personal profile when call management is enabled
        isPersonal &&
          isFeatureVisible(
            MarketplaceFeatures.show_call_management_functionality,
          ) && {
            key: 'reviewer-profile',
            component: ReviewerProfileTab,
            title: translate('Reviewer profile'),
          },
        // Audit log - staff/support viewing other users (personal has /profile/events/)
        (currentUser.is_staff || currentUser.is_support) &&
          !isPersonal && {
            key: 'audit-log',
            component: UserEvents,
            title: translate('Audit log'),
          },
        // SSH Keys - staff/support viewing other users (personal has /profile/keys/)
        isFeatureVisible(UserFeatures.ssh_keys) &&
          (currentUser.is_staff || currentUser.is_support) &&
          !isPersonal && {
            key: 'keys',
            component: KeysList,
            title: translate('Keys'),
          },
        // Remote accounts - staff/support viewing other users (personal has /profile/remote-accounts/)
        (currentUser.is_staff || currentUser.is_support) &&
          !isPersonal && {
            key: 'remote-accounts',
            component: UserOfferingList,
            title: translate('Remote accounts'),
          },
        // Roles and permissions - staff/support viewing other users (personal has affiliations in dashboard)
        (currentUser.is_staff || currentUser.is_support) &&
          !isPersonal && {
            key: 'roles',
            component: UserAffiliationsList,
            title: translate('Roles and permissions'),
          },
        // Data access - staff/support viewing any user, or user viewing own profile
        isFeatureVisible(UserFeatures.show_data_access) &&
          (currentUser.is_staff || currentUser.is_support || isPersonal) && {
            key: 'data-access',
            component: DataAccessTab,
            title: translate('Data access'),
          },
        (!isFeatureVisible(UserFeatures.disable_user_termination) ||
          currentUser.is_staff) && {
          key: 'termination',
          component:
            // Staff can always terminate other users
            currentUser.is_staff && !isPersonal
              ? UserTermination
              : isValidUser
                ? isPersonal
                  ? UserDeleteAccount
                  : UserTermination
                : NotAllowedTab,
          title: translate('Termination actions'),
          // Staff viewing others: always enabled; otherwise: requires valid user
          disabled: currentUser.is_staff && !isPersonal ? false : !isValidUser,
        },
      ].filter(Boolean),
    [user, currentUser, isValidUser, isPersonal],
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
        banner: (
          <CompleteYourProfileBanner
            missingFields={profileCompleteness?.missing_fields}
          />
        ),
      };
    }
    return null;
  }, [isPersonal, isValidUser, profileCompleteness]);

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
