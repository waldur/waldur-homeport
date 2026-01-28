import { UIView } from '@uirouter/react';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { StateDeclaration } from '@waldur/core/types';
import { MarketplaceFeatures, SupportFeatures } from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';
import { isStaffOrSupport } from '@waldur/workspace/selectors';

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

  // Dashboard - landing page for reporting
  {
    name: 'reporting-dashboard',
    url: '?tab',
    parent: 'reporting',
    component: lazyComponent(() =>
      import('./dashboard/ReportingDashboard').then((module) => ({
        default: module.ReportingDashboard,
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
    abstract: true,
    parent: 'reporting',
    component: UIView,
    url: '',
    redirectTo: 'reporting-resource-usage',
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
    },
  },
  {
    name: 'reporting-project-detail',
    url: 'project-detail/:project_uuid/',
    parent: 'reporting-resources',
    component: lazyComponent(() =>
      import('./project-detail/ProjectDetailPage').then((module) => ({
        default: module.ProjectDetailPage,
      })),
    ),
    data: {
      breadcrumb: () => translate('Project detail'),
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
    },
  },

  // Proposals & Reviews category (feature-based visibility)
  // Requires both call management AND experimental flags since all children use mock data
  {
    name: 'reporting-proposals-category',
    abstract: true,
    parent: 'reporting',
    component: UIView,
    url: '',
    redirectTo: 'reporting-call-performance',
    data: {
      breadcrumb: () => translate('Proposals'),
      priority: 200,
      feature: MarketplaceFeatures.show_experimental_ui_components,
    },
  },
  {
    name: 'reporting-call-performance',
    url: 'call-performance/',
    parent: 'reporting-proposals-category',
    component: lazyComponent(() =>
      import('./proposals/CallPerformanceList').then((module) => ({
        default: module.CallPerformanceList,
      })),
    ),
    data: {
      breadcrumb: () => translate('Call performance'),
      feature: MarketplaceFeatures.show_experimental_ui_components,
    },
  },
  {
    name: 'reporting-review-progress',
    url: 'review-progress/',
    parent: 'reporting-proposals-category',
    component: lazyComponent(() =>
      import('./proposals/ReviewProgressList').then((module) => ({
        default: module.ReviewProgressList,
      })),
    ),
    data: {
      breadcrumb: () => translate('Review progress'),
      feature: MarketplaceFeatures.show_experimental_ui_components,
    },
  },
  {
    name: 'reporting-resource-demand',
    url: 'resource-demand/',
    parent: 'reporting-proposals-category',
    component: lazyComponent(() =>
      import('./proposals/ResourceDemandList').then((module) => ({
        default: module.ResourceDemandList,
      })),
    ),
    data: {
      breadcrumb: () => translate('Resource demand'),
      feature: MarketplaceFeatures.show_experimental_ui_components,
    },
  },
  {
    name: 'reporting-call-performance-analytics',
    url: 'call-performance-analytics/?mode',
    parent: 'reporting-proposals-category',
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
    parent: 'reporting-proposals-category',
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
    parent: 'reporting-proposals-category',
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
    abstract: true,
    parent: 'reporting',
    component: UIView,
    url: '',
    redirectTo: 'reporting-capacity',
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
    },
  },

  // Users category - Platform level (staff/support only)
  {
    name: 'reporting-users',
    abstract: true,
    parent: 'reporting',
    component: UIView,
    url: '',
    redirectTo: 'reporting-user-demographics',
    data: {
      breadcrumb: () => translate('Users'),
      priority: 350,
    },
  },
  {
    name: 'reporting-user-demographics',
    url: 'user-demographics/',
    parent: 'reporting-users',
    component: lazyComponent(() =>
      import('./users/UserDemographicsPage').then((m) => ({
        default: m.UserDemographicsPage,
      })),
    ),
    data: {
      breadcrumb: () => translate('Demographics'),
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
    name: 'reporting-user-organizations',
    url: 'user-organizations/',
    parent: 'reporting-users',
    component: lazyComponent(() =>
      import('./users/UserOrganizationsPage').then((m) => ({
        default: m.UserOrganizationsPage,
      })),
    ),
    data: {
      breadcrumb: () => translate('Organizations'),
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
    },
  },

  // Financial category (staff/support only) - renamed from Platform
  {
    name: 'reporting-financial',
    abstract: true,
    parent: 'reporting',
    component: UIView,
    url: '',
    redirectTo: 'reporting-growth',
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
      import('./invoices/GrowthContainer').then((module) => ({
        default: module.GrowthContainer,
      })),
    ),
    data: {
      breadcrumb: () => translate('Growth'),
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
    },
  },

  // Infrastructure category (staff/support only)
  {
    name: 'reporting-infrastructure',
    abstract: true,
    parent: 'reporting',
    component: UIView,
    url: '',
    redirectTo: 'reporting-vm-overview',
    data: {
      breadcrumb: () => translate('Infrastructure'),
      priority: 450,
    },
  },
  {
    name: 'reporting-vm-overview',
    url: 'vm-overview/',
    parent: 'reporting-infrastructure',
    component: lazyComponent(() =>
      import('./openstack/VmTypeOverviewContainer').then((module) => ({
        default: module.VmTypeOverviewContainer,
      })),
    ),
    data: {
      feature: SupportFeatures.vm_type_overview,
      breadcrumb: () => translate('VM type overview'),
    },
  },

  // Operations category (cross-provider maintenance reporting)
  {
    name: 'reporting-operations',
    abstract: true,
    parent: 'reporting',
    component: UIView,
    url: '',
    redirectTo: 'reporting-maintenance-overview',
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
    },
  },

  // Legacy redirect routes for backward compatibility
  {
    name: 'reporting.organizations',
    url: 'organizations/',
    abstract: true,
    component: UIView,
    redirectTo: 'reporting-revenue',
    data: {
      skipBreadcrumb: true,
    },
  },
  {
    name: 'reporting.pricelist',
    url: 'pricelist-old/',
    abstract: true,
    component: UIView,
    redirectTo: 'reporting-pricelist',
    data: {
      skipBreadcrumb: true,
    },
  },
  {
    name: 'reporting.quotas',
    url: 'quotas-old/',
    abstract: true,
    component: UIView,
    redirectTo: 'reporting-quotas',
    data: {
      skipBreadcrumb: true,
    },
  },
  {
    name: 'reporting.vm-type-overview',
    url: 'vm-type-overview-old/',
    abstract: true,
    component: UIView,
    redirectTo: 'reporting-vm-overview',
    data: {
      skipBreadcrumb: true,
    },
  },
  {
    name: 'invoicesGrowth',
    url: 'growth-old/',
    abstract: true,
    parent: 'reporting',
    component: UIView,
    redirectTo: 'reporting-growth',
    data: {
      skipBreadcrumb: true,
    },
  },
  {
    name: 'marketplace-support-plan-usages',
    url: 'plan-usages/',
    abstract: true,
    parent: 'reporting',
    component: UIView,
    redirectTo: 'reporting-capacity',
    data: {
      skipBreadcrumb: true,
    },
  },
  {
    name: 'marketplace-support-usage-reports',
    url: 'usage-reports/',
    abstract: true,
    parent: 'reporting',
    component: UIView,
    redirectTo: 'reporting-resource-usage',
    data: {
      skipBreadcrumb: true,
    },
  },
  {
    name: 'marketplace-support-user-usage-reports',
    url: 'user-reports/',
    abstract: true,
    parent: 'reporting',
    component: UIView,
    redirectTo: 'reporting-user-usage',
    data: {
      skipBreadcrumb: true,
    },
  },
];
