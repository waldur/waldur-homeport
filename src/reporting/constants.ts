import {
  MarketplaceFeatures,
  SupportFeatures,
  FeaturesEnum,
} from '@/FeaturesEnums';
import { translate } from '@/i18n';
import { ProfileAttribute } from '@/user/support/profileAttributes';
import {
  hasAnyOrganizationAccess,
  isServiceProviderManager,
  isStaffOrSupport,
} from '@/workspace/selectors';

import { AnalyticsMode } from './analytics';
import { isReportingScreenEnabled } from './utils';

export type ReportCategory =
  | 'resources'
  | 'provider'
  | 'financial'
  | 'proposals'
  | 'users'
  | 'operations';

export interface ReportDefinition {
  key: string;
  title: string;
  description?: string;
  state: string;
  /** Optional feature flag - report only visible when feature is enabled */
  feature?: FeaturesEnum;
  /** Optional profile attribute - report only visible when attribute is enabled */
  attribute?: ProfileAttribute;
  /** Analytics modes supported by this report */
  analytics?: AnalyticsMode[];
  /** State for analytics page navigation */
  analyticsState?: string;
  /** Flag to indicate if this report is experimental (hidden unless experimental UI is enabled) */
  isExperimental?: boolean;
  /** Flag to indicate if this report is hidden from the main report list */
  isHidden?: boolean;
}

interface CategoryConfig {
  title: string;
  reports: ReportDefinition[];
  feature?: FeaturesEnum;
  /** Permission check function based on workspace state */
  permission?(state: any): boolean;
}

export const getCategoryConfig = (): Record<ReportCategory, CategoryConfig> => {
  const config: Record<ReportCategory, CategoryConfig> = {
    resources: {
      title: translate('Resources'),
      permission: hasAnyOrganizationAccess,
      reports: [
        {
          key: 'resource-usage',
          title: translate('Usage'),
          description: translate('Resource usage metrics across organizations'),
          state: 'reporting-resource-usage',
        },
        {
          key: 'user-usage',
          title: translate('Usage by user'),
          description: translate('Usage metrics broken down by user'),
          state: 'reporting-user-usage',
        },
        {
          key: 'quotas',
          title: translate('Quotas'),
          description: translate('Organization quota limits and usage'),
          state: 'reporting-quotas',
          analytics: ['what-if', 'why-so'],
          analyticsState: 'reporting-quotas-analytics',
        },
        {
          key: 'reporting-quotas-analytics',
          title: translate('Quota Analysis'),
          description: translate(
            'In-depth analysis of organization quota limits and usage projections',
          ),
          state: 'reporting-quotas-analytics',
          isHidden: true,
        },
        {
          key: 'usage-monitoring',
          title: translate('Usage monitoring'),
          description: translate('Detect missing or anomalous usage reports'),
          state: 'reporting-usage-monitoring',
        },
        {
          key: 'usage-trends',
          title: translate('Usage trends'),
          description: translate('Year-over-year usage analysis and growth'),
          state: 'reporting-usage-trends',
        },
        {
          key: 'organization-summary',
          title: translate('Organization summary'),
          description: translate(
            'Resources, limits, and usage by organization',
          ),
          state: 'reporting-organization-summary',
        },
        {
          key: 'project-detail',
          title: translate('Project detail'),
          description: translate('Resource limit and usage history over time'),
          state: 'reporting-project-detail',
        },
        {
          key: 'resources-geography',
          title: translate('Geographic distribution'),
          description: translate(
            'Resources by country, organization group, and offering',
          ),
          state: 'reporting-resources-geography',
        },
        {
          key: 'project-classification',
          title: translate('Project classification'),
          description: translate(
            'Project usage by OECD code and industry classification',
          ),
          state: 'reporting-project-classification',
        },
        {
          key: 'usage-by-customer',
          title: translate('Usage by customer'),
          description: translate(
            'Full resource breakdown per customer with usages, limits, and costs',
          ),
          state: 'reporting-usage-by-customer',
        },
        {
          key: 'usage-by-org-type',
          title: translate('Usage by organization type'),
          description: translate(
            'Resource usage grouped by creator organization type',
          ),
          state: 'reporting-usage-by-org-type',
        },
        {
          key: 'usage-by-creator',
          title: translate('Usage by creator'),
          description: translate(
            'Resource usage by creator affiliations and organization type',
          ),
          state: 'reporting-usage-by-creator',
        },
      ],
    },
    provider: {
      title: translate('Provider'),
      permission: isServiceProviderManager,
      reports: [
        {
          key: 'capacity',
          title: translate('Capacity'),
          description: translate('Available capacity of offering plans'),
          state: 'reporting-capacity',
          analytics: ['what-if', 'why-so'],
          analyticsState: 'reporting-capacity-analytics',
        },
        {
          key: 'reporting-capacity-analytics',
          title: translate('Capacity Analysis'),
          description: translate(
            'Detailed analysis of offering plan capacities and growth scenarios',
          ),
          state: 'reporting-capacity-analytics',
          isHidden: true,
        },
        {
          key: 'provider-overview',
          title: translate('Provider overview'),
          description: translate('KPI dashboard with key provider metrics'),
          state: 'reporting-provider-overview',
        },
        {
          key: 'provider-revenue',
          title: translate('Provider revenue'),
          description: translate('Monthly revenue trends for provider'),
          state: 'reporting-provider-revenue',
        },
        {
          key: 'provider-orders',
          title: translate('Provider orders'),
          description: translate('Order statistics and trends for provider'),
          state: 'reporting-provider-orders',
        },
        {
          key: 'provider-resources',
          title: translate('Provider resources'),
          description: translate('Resource statistics by state and offering'),
          state: 'reporting-provider-resources',
        },
        {
          key: 'provider-customers',
          title: translate('Provider customers'),
          description: translate('Customer acquisition and top customers'),
          state: 'reporting-provider-customers',
        },
        {
          key: 'provider-offerings',
          title: translate('Provider offerings'),
          description: translate('Offering performance metrics'),
          state: 'reporting-provider-offerings',
        },
        {
          key: 'openstack-instances',
          title: translate('OpenStack instances'),
          description: translate(
            'OpenStack instance inventory and aggregated metrics',
          ),
          state: 'reporting-openstack-instances',
        },
        {
          key: 'vm-type-overview',
          title: translate('VM type overview'),
          description: translate('Virtual machine types across platform'),
          state: 'reporting-vm-overview',
          feature: SupportFeatures.vm_type_overview,
        },
        {
          key: 'offering-usage',
          title: translate('Offering component usage'),
          description: translate(
            'Aggregated allocated and consumed units per component',
          ),
          state: 'reporting-offering-usage',
        },
      ],
    },
    financial: {
      title: translate('Financial'),
      permission: isStaffOrSupport,
      reports: [
        {
          key: 'growth',
          title: translate('Growth'),
          description: translate('Monthly revenue changes over time'),
          state: 'reporting-growth',
        },
        {
          key: 'revenue',
          title: translate('Monthly revenue'),
          description: translate('Revenue breakdown by organization'),
          state: 'reporting-revenue',
        },
        {
          key: 'pricelist',
          title: translate('Pricelist'),
          description: translate('Marketplace offering prices'),
          state: 'reporting-pricelist',
          feature: SupportFeatures.pricelist,
        },
        {
          key: 'offering-costs',
          title: translate('Offering costs'),
          description: translate('Cost metrics per offering'),
          state: 'reporting-offering-costs',
        },
      ],
    },
    proposals: {
      title: translate('Proposals'),
      feature: MarketplaceFeatures.show_call_management_functionality,
      reports: [
        {
          key: 'call-performance',
          title: translate('Call performance'),
          description: translate(
            'Submission statistics and acceptance rates across calls',
          ),
          state: 'reporting-call-performance',
          analytics: ['what-if', 'why-so'],
          analyticsState: 'reporting-call-performance-analytics',
          isExperimental: true,
        },
        {
          key: 'reporting-call-performance-analytics',
          title: translate('Call Performance Analysis'),
          description: translate(
            'Statistical analysis of call submissions and acceptance patterns',
          ),
          state: 'reporting-call-performance-analytics',
          isHidden: true,
        },
        {
          key: 'review-progress',
          title: translate('Review progress'),
          description: translate('Reviewer workload and completion metrics'),
          state: 'reporting-review-progress',
          analytics: ['what-if', 'why-so'],
          analyticsState: 'reporting-review-progress-analytics',
          isExperimental: true,
        },
        {
          key: 'reporting-review-progress-analytics',
          title: translate('Review Progress Analysis'),
          description: translate(
            'Analysis of reviewer workload and review completion timelines',
          ),
          state: 'reporting-review-progress-analytics',
          isHidden: true,
        },
        {
          key: 'resource-demand',
          title: translate('Resource demand'),
          description: translate('Resources requested through proposals'),
          state: 'reporting-resource-demand',
          analytics: ['what-if', 'why-so'],
          analyticsState: 'reporting-resource-demand-analytics',
          isExperimental: true,
        },
        {
          key: 'reporting-resource-demand-analytics',
          title: translate('Resource Demand Analysis'),
          description: translate(
            'Forecasting resource demand based on proposal trends',
          ),
          state: 'reporting-resource-demand-analytics',
          isHidden: true,
        },
      ],
    },
    users: {
      title: translate('Users'),
      permission: isStaffOrSupport,
      reports: [
        {
          key: 'user-demographics',
          title: translate('Demographics'),
          description: translate(
            'User distribution by authentication and identity',
          ),
          state: 'reporting-user-demographics',
          analytics: ['what-if', 'why-so'],
          analyticsState: 'reporting-user-demographics-analytics',
        },
        {
          key: 'reporting-user-demographics-analytics',
          title: translate('Demographics Analysis'),
          description: translate(
            'Interactive analysis of user distribution by identity and education',
          ),
          state: 'reporting-user-demographics-analytics',
          isHidden: true,
        },
        {
          key: 'user-analytics',
          title: translate('Analytics'),
          description: translate(
            'Interactive user statistics with export options',
          ),
          state: 'reporting-user-analytics',
        },
        {
          key: 'user-affiliations',
          title: translate('Affiliations'),
          description: translate(
            'User distribution by affiliation type (faculty, student, staff, etc.)',
          ),
          state: 'reporting-user-affiliations',
          attribute: 'affiliations',
        },
        {
          key: 'user-roles',
          title: translate('Role distribution'),
          description: translate('Member counts per organization'),
          state: 'reporting-user-roles',
        },
      ],
    },
    operations: {
      title: translate('Operations'),
      reports: [
        {
          key: 'orders',
          title: translate('Orders'),
          description: translate('Daily order trends and status distribution'),
          state: 'reporting-orders',
        },
        {
          key: 'maintenance-overview',
          title: translate('Maintenance overview'),
          description: translate(
            'Cross-provider maintenance analytics and timeline',
          ),
          state: 'reporting-maintenance-overview',
        },
        {
          key: 'provisioning-stats',
          title: translate('Provisioning statistics'),
          description: translate('Order success rates and provisioning trends'),
          state: 'reporting-provisioning-stats',
        },
      ],
    },
  };

  // Apply isReportingScreenEnabled filtering globally
  Object.values(config).forEach((category) => {
    if (category?.reports) {
      category.reports = category.reports.filter((r) =>
        isReportingScreenEnabled(r.key),
      );
    }
  });

  return config;
};
