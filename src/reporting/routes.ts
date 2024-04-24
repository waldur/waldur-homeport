import { UIView } from '@uirouter/react';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { StateDeclaration } from '@waldur/core/types';
import { SupportFeatures } from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';
import { isStaffOrSupport } from '@waldur/workspace/selectors';

const ReportingDashboard = lazyComponent(
  () => import('./dashboard/ReportingDashboard'),
  'ReportingDashboard',
);
const CustomerListContainer = lazyComponent(
  () => import('@waldur/customer/list/CustomerListContainer'),
  'CustomerListContainer',
);
const PriceList = lazyComponent(
  () => import('@waldur/marketplace/offerings/PriceList'),
  'PriceList',
);
const GrowthContainer = lazyComponent(
  () => import('./invoices/GrowthContainer'),
  'GrowthContainer',
);
const CustomerQuotasList = lazyComponent(
  () => import('./quotas/CustomerQuotasList'),
  'CustomerQuotasList',
);
const VmTypeOverviewContainer = lazyComponent(
  () => import('./openstack/VmTypeOverviewContainer'),
  'VmTypeOverviewContainer',
);
const PlanUsageList = lazyComponent(
  () => import('./plan-usage/PlanUsageList'),
  'PlanUsageList',
);
const ResourceUsageList = lazyComponent(
  () => import('./resource-usage/ResourceUsageList'),
  'ResourceUsageList',
);

export const states: StateDeclaration[] = [
  {
    name: 'reporting',
    url: '/reporting/',
    abstract: true,
    parent: 'layout',
    component: UIView,
    data: {
      title: () => translate('Reporting'),
      permissions: [isStaffOrSupport],
      hideProjectSelector: true,
    },
  },
  {
    name: 'reporting-dashboard',
    url: '',
    parent: 'reporting',
    component: ReportingDashboard,
    data: {
      breadcrumb: () => translate('Dashboard'),
      priority: 100,
    },
  },
  {
    name: 'reporting.organizations',
    url: 'organizations/',
    component: CustomerListContainer,
    data: {
      breadcrumb: () => translate('Monthly revenue'),
    },
  },
  {
    name: 'reporting.pricelist',
    url: 'pricelist/',
    component: PriceList,
    data: {
      feature: SupportFeatures.pricelist,
      breadcrumb: () => translate('Pricelist'),
    },
  },

  {
    name: 'invoicesGrowth',
    url: 'growth/',
    component: GrowthContainer,
    parent: 'reporting',
    data: {
      breadcrumb: () => translate('Growth'),
    },
  },

  {
    name: 'reporting.quotas',
    url: 'quotas/',
    component: CustomerQuotasList,
    data: {
      breadcrumb: () => translate('Organization quotas'),
    },
  },
  {
    name: 'reporting.vm-type-overview',
    url: 'vm-type-overview/',
    component: VmTypeOverviewContainer,
    data: {
      feature: SupportFeatures.vm_type_overview,
      breadcrumb: () => translate('VM type overview'),
    },
  },
  {
    name: 'marketplace-support-plan-usages',
    url: 'plan-usages/',
    component: PlanUsageList,
    parent: 'reporting',
    data: {
      breadcrumb: () => translate('Capacity'),
    },
  },
  {
    name: 'marketplace-support-usage-reports',
    url: 'usage/',
    component: ResourceUsageList,
    parent: 'reporting',
    data: {
      breadcrumb: () => translate('Usage reports'),
    },
  },
];
