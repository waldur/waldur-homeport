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
    title: translate('Payments'),
    to: 'organization.payments',
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
