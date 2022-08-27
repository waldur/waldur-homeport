import { useMemo } from 'react';

import { translate } from '@waldur/i18n';
import { useTabs } from '@waldur/navigation/context';

export const getCustomerItems = () => [
  {
    title: translate('Profile'),
    to: 'organization.dashboard',
  },
  {
    title: translate('Settings'),
    to: 'organization.manage',
  },
  {
    title: translate('Team'),
    children: [
      {
        title: translate('Users'),
        to: 'organization.users',
      },
      {
        title: translate('Invitations'),
        to: 'organization.invitations',
      },
      {
        title: translate('Group invitations'),
        to: 'organization.group-invitations',
      },
      {
        title: translate('Permission log'),
        to: 'organization.permissions-log',
      },
      {
        title: translate('Reviews'),
        to: 'organization.permissions-reviews',
      },
      {
        title: translate('Offering permissions'),
        to: 'organization.offering-permissions',
      },
    ],
  },
  {
    title: translate('Payments'),
    children: [
      {
        title: translate('Payment profiles'),
        to: 'organization.payment-profiles',
      },
      {
        title: translate('Payments'),
        to: 'organization.payments',
      },
    ],
  },
  {
    title: translate('My offerings'),
    to: 'marketplace-my-offerings',
  },
  {
    title: translate('Billing'),
    to: 'organization.billing',
  },
  {
    title: translate('Audit logs'),
    to: 'organization.details',
  },
];

export const useCustomerItems = () => {
  const tabs = useMemo(() => getCustomerItems(), []);
  useTabs(tabs);
};
