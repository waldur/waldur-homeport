import { UIView } from '@uirouter/react';
import React from 'react';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { StateDeclaration } from '@waldur/core/types';
import { MarketplaceFeatures, SupportFeatures } from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';
import { isStaffOrSupport } from '@waldur/workspace/selectors';

import { isReportingScreenEnabled } from './utils';

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
      hideHeaderMenu: true,
    },
  },

  {
    name: 'reporting-dashboard-layout',
    parent: 'reporting',
    url: '',
    abstract: true,
    component: lazyComponent(() =>
      import('./ReportingLayout').then((module) => ({
        default: module.ReportingLayout,
      })),
    ),
  },

  // Dashboard - landing page for reporting
  {
    name: 'reporting-dashboard',
    url: '?tab',
    parent: 'reporting-dashboard-layout',
    component: lazyComponent(() =>
      import('./GrowthPage').then((module) => ({
        default: module.GrowthPage,
      })),
    ),
    data: {
      breadcrumb: () => translate('Dashboard'),
      priority: 10,
    },
  },

  // Resources category (consumer-facing)
  {
    name: 'reporting-resources',
    url: 'resources/',
    parent: 'reporting',
    component: UIView,
    abstract: true,
    data: {
      breadcrumb: () => translate('Resources'),
      priority: 100,
    },
  },
  {
    name: 'reporting-resources-list',
    url: 'resources/',
    parent: 'reporting-dashboard-layout',
    component: lazyComponent(() =>
      import('./ReportingReportList').then((module) => ({
        default: () =>
          React.createElement(module.ReportingReportList, {
            category: 'resources',
          }),
      })),
    ),
    data: {
      breadcrumb: () => translate('Resources'),
      priority: 100,
    },
  },
  {
    name: 'reporting-resource-usage',
    url: 'resource-usage/',
    parent: 'reporting-resources',
    component: lazyComponent(() =>
      import('./resource-usage/ResourceUsageList').then((module) => ({
        default: module.ResourceUsageList,
      })),
    ),
    data: {
      breadcrumb: () => translate('Usage'),
      permissions: [() => isReportingScreenEnabled('resource-usage')],
    },
  },
  {
    name: 'reporting-user-usage',
    url: 'user-usage/',
    parent: 'reporting-resources',
    component: lazyComponent(() =>
      import('./resource-usage/UserUsageList').then((module) => ({
        default: module.UserUsageList,
      })),
    ),
    data: {
      breadcrumb: () => translate('Usage by user'),
      permissions: [() => isReportingScreenEnabled('user-usage')],
    },
  },
  {
    name: 'reporting-quotas',
    url: 'quotas/',
    parent: 'reporting-resources',
    component: lazyComponent(() =>
      import('./quotas/CustomerQuotasList').then((module) => ({
        default: module.CustomerQuotasList,
      })),
    ),
    data: {
      breadcrumb: () => translate('Quotas'),
      permissions: [() => isReportingScreenEnabled('quotas')],
    },
  },
  {
    name: 'reporting-quotas-analytics',
    url: 'quotas-analytics/?mode',
    parent: 'reporting-resources',
    component: lazyComponent(() =>
      import('./quotas/QuotasAnalyticsPage').then((module) => ({
        default: module.QuotasAnalyticsPage,
      })),
    ),
    data: {
      breadcrumb: () => translate('Quota Analysis'),
      feature: MarketplaceFeatures.show_experimental_ui_components,
    },
  },
  {
    name: 'reporting-usage-monitoring',
    url: 'usage-monitoring/',
    parent: 'reporting-resources',
    component: lazyComponent(() =>
      import('./usage-monitoring/UsageMonitoringPage').then((module) => ({
        default: module.UsageMonitoringPage,
      })),
    ),
    data: {
      breadcrumb: () => translate('Usage monitoring'),
      permissions: [() => isReportingScreenEnabled('usage-monitoring')],
    },
  },
  {
    name: 'reporting-usage-trends',
    url: 'usage-trends/',
    parent: 'reporting-resources',
    component: lazyComponent(() =>
      import('./usage-trends/UsageTrendsPage').then((module) => ({
        default: module.UsageTrendsPage,
      })),
    ),
    data: {
      breadcrumb: () => translate('Usage trends'),
      permissions: [() => isReportingScreenEnabled('usage-trends')],
    },
  },
  {
    name: 'reporting-organization-summary',
    url: 'organization-summary/',
    parent: 'reporting-resources',
    component: lazyComponent(() =>
      import('./organization-summary/OrganizationSummaryPage').then(
        (module) => ({
          default: module.OrganizationSummaryPage,
        }),
      ),
    ),
    data: {
      breadcrumb: () => translate('Organization summary'),
      permissions: [() => isReportingScreenEnabled('organization-summary')],
    },
  },
  {
    name: 'reporting-project-detail',
    url: 'project-detail/',
    parent: 'reporting-resources',
    component: lazyComponent(() =>
      import('./project-detail/ProjectDetailPage').then((module) => ({
        default: module.ProjectDetailPage,
      })),
    ),
    params: {
      project_uuid: {
        value: null,
        squash: true,
        dynamic: true,
      },
    },
    data: {
      breadcrumb: () => translate('Project detail'),
      permissions: [() => isReportingScreenEnabled('project-detail')],
    },
  },
  {
    name: 'reporting-resources-geography',
    url: 'resources-geography/',
    parent: 'reporting-resources',
    component: lazyComponent(() =>
      import('./resources-geography/ResourcesGeographyPage').then((m) => ({
        default: m.ResourcesGeographyPage,
      })),
    ),
    data: {
      breadcrumb: () => translate('Geographic distribution'),
      permissions: [() => isReportingScreenEnabled('resources-geography')],
    },
  },
  {
    name: 'reporting-project-classification',
    url: 'project-classification/',
    parent: 'reporting-resources',
    component: lazyComponent(() =>
      import('./project-classification/ProjectClassificationPage').then(
        (m) => ({
          default: m.ProjectClassificationPage,
        }),
      ),
    ),
    data: {
      breadcrumb: () => translate('Project classification'),
      permissions: [() => isReportingScreenEnabled('project-classification')],
    },
  },
  {
    name: 'reporting-usage-by-customer',
    url: 'usage-by-customer/',
    parent: 'reporting-resources',
    component: lazyComponent(() =>
      import('./usage-by-customer/UsageByCustomerPage').then((m) => ({
        default: m.UsageByCustomerPage,
      })),
    ),
    data: {
      breadcrumb: () => translate('Usage by customer'),
      permissions: [() => isReportingScreenEnabled('usage-by-customer')],
    },
  },
  {
    name: 'reporting-usage-by-org-type',
    url: 'usage-by-org-type/',
    parent: 'reporting-resources',
    component: lazyComponent(() =>
      import('./usage-by-org-type/UsageByOrgTypePage').then((m) => ({
        default: m.UsageByOrgTypePage,
      })),
    ),
    data: {
      breadcrumb: () => translate('Usage by organization type'),
      permissions: [() => isReportingScreenEnabled('usage-by-org-type')],
    },
  },
  {
    name: 'reporting-usage-by-creator',
    url: 'usage-by-creator/',
    parent: 'reporting-resources',
    component: lazyComponent(() =>
      import('./usage-by-creator/UsageByCreatorPage').then((m) => ({
        default: m.UsageByCreatorPage,
      })),
    ),
    data: {
      breadcrumb: () => translate('Usage by creator'),
      permissions: [() => isReportingScreenEnabled('usage-by-creator')],
    },
  },

  // Proposals & Reviews category (feature-based visibility)
  // Requires both call management AND experimental flags since all children use mock data
  {
    name: 'reporting-proposals',
    url: 'proposals/',
    parent: 'reporting',
    component: UIView,
    abstract: true,
    data: {
      breadcrumb: () => translate('Proposals'),
      priority: 200,
      feature: MarketplaceFeatures.show_experimental_ui_components,
    },
  },
  {
    name: 'reporting-proposals-list',
    url: 'proposals/',
    parent: 'reporting-dashboard-layout',
    component: lazyComponent(() =>
      import('./ReportingReportList').then((module) => ({
        default: () =>
          React.createElement(module.ReportingReportList, {
            category: 'proposals',
          }),
      })),
    ),
    data: {
      breadcrumb: () => translate('Proposals'),
      priority: 200,
      feature: MarketplaceFeatures.show_experimental_ui_components,
    },
  },
  {
    name: 'reporting-call-performance',
    url: 'call-performance/',
    parent: 'reporting-proposals',
    component: lazyComponent(() =>
      import('./proposals/CallPerformanceList').then((module) => ({
        default: module.CallPerformanceList,
      })),
    ),
    data: {
      breadcrumb: () => translate('Call performance'),
      feature: MarketplaceFeatures.show_experimental_ui_components,
      permissions: [() => isReportingScreenEnabled('call-performance')],
    },
  },
  {
    name: 'reporting-review-progress',
    url: 'review-progress/',
    parent: 'reporting-proposals',
    component: lazyComponent(() =>
      import('./proposals/ReviewProgressList').then((module) => ({
        default: module.ReviewProgressList,
      })),
    ),
    data: {
      breadcrumb: () => translate('Review progress'),
      feature: MarketplaceFeatures.show_experimental_ui_components,
      permissions: [() => isReportingScreenEnabled('review-progress')],
    },
  },
  {
    name: 'reporting-resource-demand',
    url: 'resource-demand/',
    parent: 'reporting-proposals',
    component: lazyComponent(() =>
      import('./proposals/ResourceDemandList').then((module) => ({
        default: module.ResourceDemandList,
      })),
    ),
    data: {
      breadcrumb: () => translate('Resource demand'),
      feature: MarketplaceFeatures.show_experimental_ui_components,
      permissions: [() => isReportingScreenEnabled('resource-demand')],
    },
  },
  {
    name: 'reporting-call-performance-analytics',
    url: 'call-performance-analytics/?mode',
    parent: 'reporting-proposals',
    component: lazyComponent(() =>
      import('./proposals/CallPerformanceAnalyticsPage').then((module) => ({
        default: module.CallPerformanceAnalyticsPage,
      })),
    ),
    data: {
      breadcrumb: () => translate('Call Performance Analysis'),
      feature: MarketplaceFeatures.show_experimental_ui_components,
    },
  },
  {
    name: 'reporting-review-progress-analytics',
    url: 'review-progress-analytics/?mode',
    parent: 'reporting-proposals',
    component: lazyComponent(() =>
      import('./proposals/ReviewProgressAnalyticsPage').then((module) => ({
        default: module.ReviewProgressAnalyticsPage,
      })),
    ),
    data: {
      breadcrumb: () => translate('Review Progress Analysis'),
      feature: MarketplaceFeatures.show_experimental_ui_components,
    },
  },
  {
    name: 'reporting-resource-demand-analytics',
    url: 'resource-demand-analytics/?mode',
    parent: 'reporting-proposals',
    component: lazyComponent(() =>
      import('./proposals/ResourceDemandAnalyticsPage').then((module) => ({
        default: module.ResourceDemandAnalyticsPage,
      })),
    ),
    data: {
      breadcrumb: () => translate('Resource Demand Analysis'),
      feature: MarketplaceFeatures.show_experimental_ui_components,
    },
  },

  // Provider category (service provider managers)
  {
    name: 'reporting-provider',
    url: 'provider/',
    parent: 'reporting',
    component: UIView,
    abstract: true,
    data: {
      breadcrumb: () => translate('Provider'),
      priority: 300,
    },
  },
  {
    name: 'reporting-provider-list',
    url: 'provider/',
    parent: 'reporting-dashboard-layout',
    component: lazyComponent(() =>
      import('./ReportingReportList').then((module) => ({
        default: () =>
          React.createElement(module.ReportingReportList, {
            category: 'provider',
          }),
      })),
    ),
    data: {
      breadcrumb: () => translate('Provider'),
      priority: 300,
    },
  },
  {
    name: 'reporting-capacity',
    url: 'capacity/',
    parent: 'reporting-provider',
    component: lazyComponent(() =>
      import('./plan-usage/PlanUsageList').then((module) => ({
        default: module.PlanUsageList,
      })),
    ),
    data: {
      breadcrumb: () => translate('Capacity'),
      permissions: [() => isReportingScreenEnabled('capacity')],
    },
  },
  {
    name: 'reporting-capacity-analytics',
    url: 'capacity-analytics/?mode',
    parent: 'reporting-provider',
    component: lazyComponent(() =>
      import('./plan-usage/CapacityAnalyticsPage').then((module) => ({
        default: module.CapacityAnalyticsPage,
      })),
    ),
    data: {
      breadcrumb: () => translate('Capacity Analysis'),
      feature: MarketplaceFeatures.show_experimental_ui_components,
    },
  },
  {
    name: 'reporting-provider-overview',
    url: 'provider-overview/',
    parent: 'reporting-provider',
    component: lazyComponent(() =>
      import('./provider/ProviderOverviewPage').then((module) => ({
        default: module.ProviderOverviewPage,
      })),
    ),
    data: {
      breadcrumb: () => translate('Provider overview'),
      permissions: [() => isReportingScreenEnabled('provider-overview')],
    },
  },
  {
    name: 'reporting-provider-revenue',
    url: 'provider-revenue/',
    parent: 'reporting-provider',
    component: lazyComponent(() =>
      import('./provider/ProviderRevenuePage').then((module) => ({
        default: module.ProviderRevenuePage,
      })),
    ),
    data: {
      breadcrumb: () => translate('Provider revenue'),
      permissions: [() => isReportingScreenEnabled('provider-revenue')],
    },
  },
  {
    name: 'reporting-provider-orders',
    url: 'provider-orders/',
    parent: 'reporting-provider',
    component: lazyComponent(() =>
      import('./provider/ProviderOrdersPage').then((module) => ({
        default: module.ProviderOrdersPage,
      })),
    ),
    data: {
      breadcrumb: () => translate('Provider orders'),
      permissions: [() => isReportingScreenEnabled('provider-orders')],
    },
  },
  {
    name: 'reporting-provider-resources',
    url: 'provider-resources/',
    parent: 'reporting-provider',
    component: lazyComponent(() =>
      import('./provider/ProviderResourcesPage').then((module) => ({
        default: module.ProviderResourcesPage,
      })),
    ),
    data: {
      breadcrumb: () => translate('Provider resources'),
      permissions: [() => isReportingScreenEnabled('provider-resources')],
    },
  },
  {
    name: 'reporting-provider-customers',
    url: 'provider-customers/',
    parent: 'reporting-provider',
    component: lazyComponent(() =>
      import('./provider/ProviderCustomersPage').then((module) => ({
        default: module.ProviderCustomersPage,
      })),
    ),
    data: {
      breadcrumb: () => translate('Provider customers'),
      permissions: [() => isReportingScreenEnabled('provider-customers')],
    },
  },
  {
    name: 'reporting-provider-offerings',
    url: 'provider-offerings/',
    parent: 'reporting-provider',
    component: lazyComponent(() =>
      import('./provider/ProviderOfferingsPage').then((module) => ({
        default: module.ProviderOfferingsPage,
      })),
    ),
    data: {
      breadcrumb: () => translate('Provider offerings'),
      permissions: [() => isReportingScreenEnabled('provider-offerings')],
    },
  },
  {
    name: 'reporting-offering-usage',
    url: 'offering-usage/?tab',
    parent: 'reporting-provider',
    component: lazyComponent(() =>
      import('./provider/OfferingComponentUsageList').then((module) => ({
        default: module.OfferingComponentUsageList,
      })),
    ),
    data: {
      breadcrumb: () => translate('Offering component usage'),
      permissions: [() => isReportingScreenEnabled('offering-usage')],
    },
  },

  // Users category - Platform level (staff/support only)
  {
    name: 'reporting-users',
    url: 'users/',
    parent: 'reporting',
    component: UIView,
    abstract: true,
    data: {
      breadcrumb: () => translate('Users'),
      priority: 350,
    },
  },
  {
    name: 'reporting-users-list',
    url: 'users/',
    parent: 'reporting-dashboard-layout',
    component: lazyComponent(() =>
      import('./ReportingReportList').then((module) => ({
        default: () =>
          React.createElement(module.ReportingReportList, {
            category: 'users',
          }),
      })),
    ),
    data: {
      breadcrumb: () => translate('Users'),
      priority: 350,
    },
  },
  {
    name: 'reporting-user-demographics',
    url: 'demographics/',
    parent: 'reporting-users',
    component: lazyComponent(() =>
      import('./users/UserDemographicsPage').then((m) => ({
        default: m.UserDemographicsPage,
      })),
    ),
    data: {
      breadcrumb: () => translate('Demographics'),
      permissions: [() => isReportingScreenEnabled('user-demographics')],
    },
  },
  {
    name: 'reporting-user-demographics-analytics',
    url: 'user-demographics-analytics/?mode',
    parent: 'reporting-users',
    component: lazyComponent(() =>
      import('./users/UserDemographicsAnalyticsPage').then((m) => ({
        default: m.UserDemographicsAnalyticsPage,
      })),
    ),
    data: {
      breadcrumb: () => translate('Demographics Analysis'),
      feature: MarketplaceFeatures.show_experimental_ui_components,
    },
  },
  {
    name: 'reporting-user-analytics',
    url: 'user-analytics/',
    parent: 'reporting-users',
    component: lazyComponent(() =>
      import('./users/UserAnalyticsPage').then((m) => ({
        default: m.UserAnalyticsPage,
      })),
    ),
    data: {
      breadcrumb: () => translate('Analytics'),
      permissions: [() => isReportingScreenEnabled('user-analytics')],
    },
  },
  {
    name: 'reporting-user-affiliations',
    url: 'user-affiliations/',
    parent: 'reporting-users',
    component: lazyComponent(() =>
      import('./users/UserAffiliationsPage').then((m) => ({
        default: m.UserAffiliationsPage,
      })),
    ),
    data: {
      breadcrumb: () => translate('Affiliations'),
      permissions: [() => isReportingScreenEnabled('user-affiliations')],
    },
  },
  {
    name: 'reporting-user-roles',
    url: 'user-roles/',
    parent: 'reporting-users',
    component: lazyComponent(() =>
      import('./user-roles/UserRolesPage').then((m) => ({
        default: m.UserRolesPage,
      })),
    ),
    data: {
      breadcrumb: () => translate('Role distribution'),
      permissions: [() => isReportingScreenEnabled('user-roles')],
    },
  },

  // Financial category (staff/support only) - renamed from Platform
  {
    name: 'reporting-financial',
    url: 'financial/',
    parent: 'reporting',
    component: UIView,
    abstract: true,
    data: {
      breadcrumb: () => translate('Financial'),
      priority: 400,
    },
  },
  {
    name: 'reporting-financial-list',
    url: 'financial/',
    parent: 'reporting-dashboard-layout',
    component: lazyComponent(() =>
      import('./ReportingReportList').then((module) => ({
        default: () =>
          React.createElement(module.ReportingReportList, {
            category: 'financial',
          }),
      })),
    ),
    data: {
      breadcrumb: () => translate('Financial'),
      priority: 400,
    },
  },
  {
    name: 'reporting-growth',
    url: 'growth/',
    parent: 'reporting-financial',
    component: lazyComponent(() =>
      import('./growth/RevenueGrowthPage').then((m) => ({
        default: m.RevenueGrowthPage,
      })),
    ),
    data: {
      breadcrumb: () => translate('Growth'),
      permissions: [() => isReportingScreenEnabled('growth')],
    },
  },
  {
    name: 'reporting-revenue',
    url: 'revenue/',
    parent: 'reporting-financial',
    component: lazyComponent(() =>
      import('./invoices/MonthlyRevenuePage').then((module) => ({
        default: module.MonthlyRevenuePage,
      })),
    ),
    data: {
      breadcrumb: () => translate('Monthly revenue'),
      permissions: [() => isReportingScreenEnabled('revenue')],
    },
  },
  {
    name: 'reporting-pricelist',
    url: 'pricelist/',
    parent: 'reporting-financial',
    component: lazyComponent(() =>
      import('./invoices/PricelistPage').then((module) => ({
        default: module.PricelistPage,
      })),
    ),
    data: {
      feature: SupportFeatures.pricelist,
      breadcrumb: () => translate('Pricelist'),
      permissions: [() => isReportingScreenEnabled('pricelist')],
    },
  },
  {
    name: 'reporting-orders',
    url: 'orders/',
    parent: 'reporting-financial',
    component: lazyComponent(() =>
      import('./orders/OrdersOverviewPage').then((module) => ({
        default: module.OrdersOverviewPage,
      })),
    ),
    data: {
      breadcrumb: () => translate('Orders'),
      permissions: [() => isReportingScreenEnabled('orders')],
    },
  },
  {
    name: 'reporting-offering-costs',
    url: 'offering-costs/',
    parent: 'reporting-financial',
    component: lazyComponent(() =>
      import('./offering-costs/OfferingCostsPage').then((m) => ({
        default: m.OfferingCostsPage,
      })),
    ),
    data: {
      breadcrumb: () => translate('Offering costs'),
      permissions: [() => isReportingScreenEnabled('offering-costs')],
    },
  },

  {
    name: 'reporting-vm-overview',
    url: 'vm-overview/',
    parent: 'reporting-provider',
    component: lazyComponent(() =>
      import('./provider/vm-type-overview/VmTypeOverviewContainer').then(
        (module) => ({
          default: module.VmTypeOverviewContainer,
        }),
      ),
    ),
    data: {
      feature: SupportFeatures.vm_type_overview,
      breadcrumb: () => translate('VM type overview'),
    },
  },
  {
    name: 'reporting-openstack-instances',
    url: 'openstack-instances/?tab',
    parent: 'reporting-provider',
    component: lazyComponent(() =>
      import('./openstack-instances/OpenstackInstancesPage').then((m) => ({
        default: m.OpenstackInstancesPage,
      })),
    ),
    data: {
      breadcrumb: () => translate('OpenStack instances'),
      permissions: [() => isReportingScreenEnabled('openstack-instances')],
    },
  },

  // Operations category (cross-provider maintenance reporting)
  {
    name: 'reporting-operations',
    url: 'operations/',
    parent: 'reporting',
    component: UIView,
    abstract: true,
    data: {
      breadcrumb: () => translate('Operations'),
      priority: 475,
    },
  },
  {
    name: 'reporting-operations-list',
    url: 'operations/',
    parent: 'reporting-dashboard-layout',
    component: lazyComponent(() =>
      import('./ReportingReportList').then((module) => ({
        default: () =>
          React.createElement(module.ReportingReportList, {
            category: 'operations',
          }),
      })),
    ),
    data: {
      breadcrumb: () => translate('Operations'),
      priority: 475,
    },
  },
  {
    name: 'reporting-maintenance-overview',
    url: 'maintenance-overview/',
    parent: 'reporting-operations',
    component: lazyComponent(() =>
      import('./maintenance/MaintenanceReportingOverviewPage').then(
        (module) => ({
          default: module.MaintenanceReportingOverviewPage,
        }),
      ),
    ),
    data: {
      breadcrumb: () => translate('Maintenance overview'),
      permissions: [() => isReportingScreenEnabled('maintenance-overview')],
    },
  },
  {
    name: 'reporting-provisioning-stats',
    url: 'provisioning-stats/',
    parent: 'reporting-operations',
    component: lazyComponent(() =>
      import('./provisioning-stats/ProvisioningStatsPage').then((m) => ({
        default: m.ProvisioningStatsPage,
      })),
    ),
    data: {
      breadcrumb: () => translate('Provisioning statistics'),
      permissions: [() => isReportingScreenEnabled('provisioning-stats')],
    },
  },
];
