import { useMemo } from 'react';

import { ENV } from '@waldur/configs/default';
import { isFeatureVisible } from '@waldur/features/connect';
import { translate } from '@waldur/i18n';
import { useTabs } from '@waldur/navigation/context';
import { UserDetails } from '@waldur/workspace/types';

export const getUserTabs = () =>
  [
    {
      title: translate('Dashboard'),
      to: 'profile.details',
    },
    {
      title: translate('Settings'),
      to: 'profile.manage',
    },
    {
      title: translate('Audit logs'),
      to: 'profile.events',
    },
    {
      title: translate('Credentials'),
      children: [
        {
          title: translate('SSH Keys'),
          to: 'profile.keys',
          feature: 'user.ssh_keys',
        },
        {
          title: translate('API key'),
          to: 'profile.api-key',
        },
        ENV.plugins.WALDUR_FREEIPA?.ENABLED
          ? {
              title: translate('FreeIPA account'),
              to: 'profile.freeipa',
            }
          : undefined,
        {
          title: translate('Remote accounts'),
          to: 'profile.remote-accounts',
        },
      ].filter((item) => item),
    },
    {
      title: translate('Notifications'),
      to: 'profile.notifications',
      feature: 'user.notifications',
    },
    {
      title: translate('Resources'),
      to: 'profile.flows-list',
      feature: 'marketplace.flows',
    },
    {
      title: translate('Permission requests'),
      to: 'profile.permission-requests',
      feature: 'invitations.show_group_invitations',
    },
  ].filter((item) => item && isFeatureVisible(item.feature));

export const USER_PROFILE_COMPLETION_FIELDS: Array<keyof UserDetails> = [
  'first_name',
  'last_name',
  'email',
  'job_title',
  'organization',
  'phone_number',
];

export const SELECT_AFFILIATION_FORM_ID = 'SelectAffiliation';
export const ORGANIZATION_ROUTE = 'marketplace-category-customer';
export const PROJECT_ROUTE = 'marketplace-category-project';
export const USER_PERMISSION_REQUESTS_TABLE_ID =
  'user-permission-requests-table';
export const USER_PERMISSION_REQUESTS_FILTER_FORM_ID =
  'user-permission-requests-table-filter-form';

export const useUserTabs = () => {
  const tabs = useMemo(() => getUserTabs(), []);
  useTabs(tabs);
};
