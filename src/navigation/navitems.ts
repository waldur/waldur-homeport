import { useMemo } from 'react';

import { ENV } from '@waldur/configs/default';
import { translate } from '@waldur/i18n';
import { useTabs } from '@waldur/navigation/context';

export const getProjectItems = () => [
  {
    title: translate('Profile'),
    to: 'project.details',
  },
  {
    title: translate('Settings'),
    to: 'project.manage',
  },
  {
    title: translate('Team'),
    children: [
      {
        title: translate('Users'),
        to: 'project.users',
      },
      {
        title: translate('Invitations'),
        to: 'project.invitations',
      },
      {
        title: translate('Permissions log'),
        to: 'project.permissions-log',
      },
    ],
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

const getAdminItems = () => [
  {
    title: translate('Users'),
    to: 'admin.users',
  },
  {
    title: translate('Organizations'),
    to: 'admin.customers',
  },
  {
    title: translate('Projects'),
    to: 'admin.projects',
  },
  { title: translate('Offerings'), to: 'marketplace-support-offerings' },
  { title: translate('Orders'), to: 'marketplace-support-orders' },
  { title: translate('Features'), to: 'admin.features' },
];

export const useAdminItems = () => {
  const tabs = useMemo(() => getAdminItems(), []);
  useTabs(tabs);
};

const getSupportItems = () =>
  [
    ENV.plugins.WALDUR_SUPPORT && {
      title: translate('Issues'),
      to: 'support.list',
    },
    ENV.plugins.WALDUR_SUPPORT && {
      title: translate('Feedback'),
      to: 'support.feedback',
    },
    { title: translate('Broadcast'), to: 'support.broadcast' },
    {
      title: translate('Resources'),
      to: 'marketplace-support-resources',
    },
    {
      title: translate('Organization requests'),
      to: 'support.customers-requests',
    },
    { title: translate('Shared providers'), to: 'support.shared-providers' },
    { title: translate('Audit log'), to: 'support.events' },
  ].filter((x) => x);

export const useSupportItems = () => {
  const tabs = useMemo(() => getSupportItems(), []);
  useTabs(tabs);
};

export const getProviderItems = () => [
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

export const getAboutItems = () => [
  {
    title: translate('Terms of Service'),
    to: 'tos.index',
  },
  {
    title: translate('Privacy policy'),
    to: 'policy.privacy',
  },
];

export const useAboutItems = () => {
  const tabs = useMemo(() => getAboutItems(), []);
  useTabs(tabs);
};
