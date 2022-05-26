import { useMemo } from 'react';

import { translate } from '@waldur/i18n';
import { useTabs } from '@waldur/navigation/context';

const getProjectItems = () => [
  {
    title: translate('Profile'),
    to: 'project.details',
  },
  { title: translate('My orders'), to: 'marketplace-order-list' },
  {
    title: translate('Audit logs'),
    to: 'project.events',
  },
];

export const useProjectItems = () => {
  const tabs = useMemo(() => getProjectItems(), []);
  useTabs(tabs);
};

const getTeamItems = () => [
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
];

export const useTeamItems = () => {
  const tabs = useMemo(() => getTeamItems(), []);
  useTabs(tabs);
};

const getAdminItems = () => [
  {
    title: translate('Users'),
    to: 'support.users',
  },
  {
    title: translate('Organizations'),
    to: 'support.customers',
  },
  { title: translate('Offerings'), to: 'marketplace-support-offerings' },
  { title: translate('Orders'), to: 'marketplace-support-orders' },
  { title: translate('Features'), to: 'support.features' },
];

export const useAdminItems = () => {
  const tabs = useMemo(() => getAdminItems(), []);
  useTabs(tabs);
};

const getSupportItems = () => [
  { title: translate('Issues'), to: 'support.list' },
  { title: translate('Feedback'), to: 'support.feedback' },
  { title: translate('Broadcast'), to: 'support.broadcast' },
  {
    title: translate('Organization requests'),
    to: 'support.customers-requests',
  },
  { title: translate('Shared providers'), to: 'support.shared-providers' },
  { title: translate('Audit log'), to: 'support.events' },
];

export const useSupportItems = () => {
  const tabs = useMemo(() => getSupportItems(), []);
  useTabs(tabs);
};

const getProviderItems = () => [
  {
    title: translate('Public offerings'),
    to: 'marketplace-vendor-offerings',
  },
  {
    title: translate('Public resources'),
    to: 'marketplace-public-resources',
  },
  {
    title: translate('Public orders'),
    to: 'marketplace-order-items',
  },
];

export const useProviderItems = () => {
  const tabs = useMemo(() => getProviderItems(), []);
  useTabs(tabs);
};
