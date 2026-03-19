import { QuestionIcon } from '@phosphor-icons/react';
import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { Card, Nav, Tab } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import { Badge } from '@waldur/core/Badge';
import { Link } from '@waldur/core/Link';
import { Tip } from '@waldur/core/Tooltip';
import { isFeatureVisible } from '@waldur/features/connect';
import { MarketplaceFeatures, SupportFeatures } from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';
import { isExperimentalUiComponentsVisible } from '@waldur/marketplace/utils';
import { TableQuery } from '@waldur/table/TableQuery';
import {
  hasAnyOrganizationAccess,
  isServiceProviderManager,
  isStaffOrSupport,
} from '@waldur/workspace/selectors';

import { AnalyticsMode } from '../analytics';
import { isReportingScreenEnabled } from '../utils';

interface ReportItem {
  uuid: string;
  title: string;
  description: string;
  state: string;
  /** Analytics modes supported by this report */
  analytics?: AnalyticsMode[];
  /** State for analytics page navigation */
  analyticsState?: string;
}

interface ReportCategory {
  key: string;
  title: string;
  reports: ReportItem[];
}

const AnalyticsColumn = ({ row }: { row: ReportItem }) => {
  if (!row.analytics) {
    return null;
  }
  const hasWhatIf = row.analytics.includes('what-if');
  const hasWhySo = row.analytics.includes('why-so');

  return (
    <div className="d-flex gap-2">
      {hasWhatIf && (
        <Tip id={`${row.uuid}-whatif`} label={translate('What-If analysis')}>
          <Link state={row.analyticsState} params={{ mode: 'what-if' }}>
            <Badge
              variant="gray"
              leftIcon={<QuestionIcon weight="bold" />}
              outline
              className="cursor-pointer"
            >
              {translate('What if')}
            </Badge>
          </Link>
        </Tip>
      )}
      {hasWhySo && (
        <Tip id={`${row.uuid}-whyso`} label={translate('Why-So analysis')}>
          <Link state={row.analyticsState} params={{ mode: 'why-so' }}>
            <Badge
              variant="gray"
              leftIcon={<QuestionIcon weight="bold" />}
              outline
              className="cursor-pointer"
            >
              {translate('Why so')}
            </Badge>
          </Link>
        </Tip>
      )}
    </div>
  );
};

export const ReportingDashboard: FC = () => {
  const showResources = useSelector(hasAnyOrganizationAccess);
  const showProvider = useSelector(isServiceProviderManager);
  const showPlatform = useSelector(isStaffOrSupport);

  const showExperimental = useMemo(
    () => isExperimentalUiComponentsVisible(),
    [],
  );
  const showCallManagement = useMemo(
    () =>
      isFeatureVisible(MarketplaceFeatures.show_call_management_functionality),
    [],
  );
  const showPricelist = useMemo(
    () => isFeatureVisible(SupportFeatures.pricelist),
    [],
  );
  const showVmOverview = useMemo(
    () => isFeatureVisible(SupportFeatures.vm_type_overview),
    [],
  );

  const categories = useMemo(() => {
    const result: ReportCategory[] = [];

    // Helper to conditionally add analytics properties
    const withAnalytics = (
      item: ReportItem,
      analytics: AnalyticsMode[],
      analyticsState: string,
    ): ReportItem => {
      if (showExperimental) {
        return { ...item, analytics, analyticsState };
      }
      return item;
    };

    if (showResources) {
      result.push({
        key: 'resources',
        title: translate('Resources'),
        reports: [
          {
            uuid: 'resource-usage',
            title: translate('Usage'),
            description: translate(
              'Resource usage metrics across organizations',
            ),
            state: 'reporting-resource-usage',
          },
          {
            uuid: 'user-usage',
            title: translate('Usage by user'),
            description: translate('Usage metrics broken down by user'),
            state: 'reporting-user-usage',
          },
          withAnalytics(
            {
              uuid: 'quotas',
              title: translate('Quotas'),
              description: translate('Organization quota limits and usage'),
              state: 'reporting-quotas',
            },
            ['what-if', 'why-so'],
            'reporting-quotas-analytics',
          ),
          {
            uuid: 'usage-monitoring',
            title: translate('Usage monitoring'),
            description: translate('Detect missing or anomalous usage reports'),
            state: 'reporting-usage-monitoring',
          },
          {
            uuid: 'usage-trends',
            title: translate('Usage trends'),
            description: translate('Year-over-year usage analysis and growth'),
            state: 'reporting-usage-trends',
          },
          {
            uuid: 'organization-summary',
            title: translate('Organization summary'),
            description: translate(
              'Resources, limits, and usage by organization',
            ),
            state: 'reporting-organization-summary',
          },
          {
            uuid: 'project-detail',
            title: translate('Project detail'),
            description: translate(
              'Resource limit and usage history over time',
            ),
            state: 'reporting-project-detail',
          },
          {
            uuid: 'resources-geography',
            title: translate('Geographic distribution'),
            description: translate(
              'Resources by country, organization group, and offering',
            ),
            state: 'reporting-resources-geography',
          },
          {
            uuid: 'project-classification',
            title: translate('Project classification'),
            description: translate(
              'Project usage by OECD code and industry classification',
            ),
            state: 'reporting-project-classification',
          },
          {
            uuid: 'usage-by-customer',
            title: translate('Usage by customer'),
            description: translate(
              'Full resource breakdown per customer with usages, limits, and costs',
            ),
            state: 'reporting-usage-by-customer',
          },
          {
            uuid: 'usage-by-org-type',
            title: translate('Usage by organization type'),
            description: translate(
              'Resource usage grouped by creator organization type',
            ),
            state: 'reporting-usage-by-org-type',
          },
          {
            uuid: 'usage-by-creator',
            title: translate('Usage by creator'),
            description: translate(
              'Resource usage by creator affiliations and organization type',
            ),
            state: 'reporting-usage-by-creator',
          },
        ].filter((report) => isReportingScreenEnabled(report.uuid)),
      });
    }

    // Only show proposals category when experimental is enabled (uses mock data)
    if (showCallManagement && showExperimental) {
      result.push({
        key: 'proposals',
        title: translate('Proposals'),
        reports: [
          withAnalytics(
            {
              uuid: 'call-performance',
              title: translate('Call performance'),
              description: translate(
                'Submission statistics and acceptance rates across calls',
              ),
              state: 'reporting-call-performance',
            },
            ['what-if', 'why-so'],
            'reporting-call-performance-analytics',
          ),
          withAnalytics(
            {
              uuid: 'review-progress',
              title: translate('Review progress'),
              description: translate(
                'Reviewer workload and completion metrics',
              ),
              state: 'reporting-review-progress',
            },
            ['what-if', 'why-so'],
            'reporting-review-progress-analytics',
          ),
          withAnalytics(
            {
              uuid: 'resource-demand',
              title: translate('Resource demand'),
              description: translate('Resources requested through proposals'),
              state: 'reporting-resource-demand',
            },
            ['what-if', 'why-so'],
            'reporting-resource-demand-analytics',
          ),
        ].filter((report) => isReportingScreenEnabled(report.uuid)),
      });
    }

    if (showProvider) {
      result.push({
        key: 'provider',
        title: translate('Provider'),
        reports: [
          withAnalytics(
            {
              uuid: 'capacity',
              title: translate('Capacity'),
              description: translate('Available capacity of offering plans'),
              state: 'reporting-capacity',
            },
            ['what-if', 'why-so'],
            'reporting-capacity-analytics',
          ),
          {
            uuid: 'provider-overview',
            title: translate('Provider overview'),
            description: translate('KPI dashboard with key provider metrics'),
            state: 'reporting-provider-overview',
          },
          {
            uuid: 'provider-revenue',
            title: translate('Provider revenue'),
            description: translate('Monthly revenue trends for provider'),
            state: 'reporting-provider-revenue',
          },
          {
            uuid: 'provider-orders',
            title: translate('Provider orders'),
            description: translate('Order statistics and trends for provider'),
            state: 'reporting-provider-orders',
          },
          {
            uuid: 'provider-resources',
            title: translate('Provider resources'),
            description: translate('Resource statistics by state and offering'),
            state: 'reporting-provider-resources',
          },
          {
            uuid: 'provider-customers',
            title: translate('Provider customers'),
            description: translate('Customer acquisition and top customers'),
            state: 'reporting-provider-customers',
          },
          {
            uuid: 'provider-offerings',
            title: translate('Provider offerings'),
            description: translate('Offering performance metrics'),
            state: 'reporting-provider-offerings',
          },
          {
            uuid: 'openstack-instances',
            title: translate('OpenStack instances'),
            description: translate(
              'OpenStack instance inventory and aggregated metrics',
            ),
            state: 'reporting-openstack-instances',
          },
        ].filter((report) => isReportingScreenEnabled(report.uuid)),
      });
    }

    // Users category (staff/support only) - uses real API data
    if (showPlatform) {
      result.push({
        key: 'users',
        title: translate('Users'),
        reports: [
          withAnalytics(
            {
              uuid: 'user-demographics',
              title: translate('Demographics'),
              description: translate(
                'User distribution by authentication and identity',
              ),
              state: 'reporting-user-demographics',
            },
            ['what-if', 'why-so'],
            'reporting-user-demographics-analytics',
          ),
          {
            uuid: 'user-organizations',
            title: translate('Organizations'),
            description: translate(
              'User distribution by organization membership',
            ),
            state: 'reporting-user-organizations',
          },
          {
            uuid: 'user-affiliations',
            title: translate('Affiliations'),
            description: translate(
              'User distribution by affiliation type (faculty, student, staff, etc.)',
            ),
            state: 'reporting-user-affiliations',
          },
          {
            uuid: 'user-roles',
            title: translate('Role distribution'),
            description: translate('Member counts per organization'),
            state: 'reporting-user-roles',
          },
        ].filter((report) => isReportingScreenEnabled(report.uuid)),
      });
    }

    if (showPlatform) {
      // Financial category (renamed from Platform)
      const financialReports: ReportItem[] = [
        {
          uuid: 'growth',
          title: translate('Growth'),
          description: translate('Monthly revenue changes over time'),
          state: 'reporting-growth',
        },
        {
          uuid: 'revenue',
          title: translate('Monthly revenue'),
          description: translate('Revenue breakdown by organization'),
          state: 'reporting-revenue',
        },
      ];

      if (showPricelist) {
        financialReports.push({
          uuid: 'pricelist',
          title: translate('Pricelist'),
          description: translate('Marketplace offering prices'),
          state: 'reporting-pricelist',
        });
      }

      financialReports.push({
        uuid: 'offering-costs',
        title: translate('Offering costs'),
        description: translate('Cost metrics per offering'),
        state: 'reporting-offering-costs',
      });

      result.push({
        key: 'financial',
        title: translate('Financial'),
        reports: financialReports.filter((report) =>
          isReportingScreenEnabled(report.uuid),
        ),
      });

      // Infrastructure category
      if (showVmOverview) {
        result.push({
          key: 'infrastructure',
          title: translate('Infrastructure'),
          reports: [
            {
              uuid: 'vm-type-overview',
              title: translate('VM type overview'),
              description: translate('Virtual machine types across platform'),
              state: 'reporting-vm-overview',
            },
          ].filter((report) => isReportingScreenEnabled(report.uuid)),
        });
      }

      // Operations category
      result.push({
        key: 'operations',
        title: translate('Operations'),
        reports: [
          {
            uuid: 'orders',
            title: translate('Orders'),
            description: translate(
              'Daily order trends and status distribution',
            ),
            state: 'reporting-orders',
          },
          {
            uuid: 'maintenance-overview',
            title: translate('Maintenance overview'),
            description: translate(
              'Cross-provider maintenance analytics and timeline',
            ),
            state: 'reporting-maintenance-overview',
          },
          {
            uuid: 'provisioning-stats',
            title: translate('Provisioning statistics'),
            description: translate(
              'Order success rates and provisioning trends',
            ),
            state: 'reporting-provisioning-stats',
          },
        ].filter((report) => isReportingScreenEnabled(report.uuid)),
      });
    }

    return result.filter((category) => category.reports.length > 0);
  }, [
    showResources,
    showExperimental,
    showCallManagement,
    showProvider,
    showPlatform,
    showPricelist,
    showVmOverview,
  ]);

  const router = useRouter();
  const { params } = useCurrentStateAndParams();

  // Get initial tab from URL or default to first category
  const initialTab =
    params.tab && categories.some((c) => c.key === params.tab)
      ? params.tab
      : categories[0]?.key || 'resources';

  const [activeKey, setActiveKey] = useState(initialTab);
  const [query, setQuery] = useState('');

  // Sync URL when tab changes
  useEffect(() => {
    if (activeKey && activeKey !== params.tab) {
      router.stateService.go('.', { tab: activeKey }, { location: 'replace' });
    }
  }, [activeKey, params.tab, router]);

  // Sync state when URL changes externally
  useEffect(() => {
    if (params.tab && categories.some((c) => c.key === params.tab)) {
      setActiveKey(params.tab);
    }
  }, [params.tab, categories]);

  // Filter reports based on search query
  const filterReports = useCallback(
    (reports: ReportItem[]) => {
      if (!query.trim()) return reports;
      const searchLower = query.toLowerCase().trim();
      return reports.filter(
        (report) =>
          report.title.toLowerCase().includes(searchLower) ||
          report.description.toLowerCase().includes(searchLower),
      );
    },
    [query],
  );

  // Get filtered counts for each category
  const categoriesWithCounts = useMemo(
    () =>
      categories.map((category) => ({
        ...category,
        filteredCount: filterReports(category.reports).length,
      })),
    [categories, filterReports],
  );

  const activeCategory = categoriesWithCounts.find((c) => c.key === activeKey);
  const filteredReports = activeCategory
    ? filterReports(activeCategory.reports)
    : [];

  if (categories.length === 0) {
    return null;
  }

  return (
    <>
      <div className="table-standalone-header">
        <h1 className="mb-0 fs-1x">{translate('Reporting')}</h1>
      </div>
      <Card className="card-table card-bordered">
        <Card.Header>
          <div className="table-toolbar-search">
            <TableQuery query={query} setQuery={setQuery} />
          </div>
        </Card.Header>
        <Card.Body>
          <Tab.Container
            activeKey={activeKey}
            onSelect={(k) => setActiveKey(k)}
          >
            <div className="overflow-auto flex-grow-1 pb-2 pt-4">
              <Nav
                variant="tabs"
                className="nav-line-tabs flex-nowrap mx-0 border-bottom "
              >
                {categoriesWithCounts.map((category) => (
                  <Nav.Item key={category.key} className="text-nowrap">
                    <Nav.Link as="button" eventKey={category.key}>
                      {category.title}
                      <Badge variant="default" pill outline className="ms-2">
                        {category.filteredCount}
                      </Badge>
                    </Nav.Link>
                  </Nav.Item>
                ))}
              </Nav>
              <Tab.Content>
                {categoriesWithCounts.map((category) => (
                  <Tab.Pane
                    key={category.key}
                    eventKey={category.key}
                    active={activeKey === category.key}
                  >
                    {filteredReports.map((report) => (
                      <Link state={report.state}>
                        <Card className="card-bordered card-solid mt-4 p-5 d-flex border-hover-brand cursor-pointer d-flex flex-row">
                          <div className="flex-grow-1">
                            <p className="text-dark fw-bold fs-4 mb-1">
                              {report.title}
                            </p>
                            <p className="text-muted mb-0">
                              {report.description}
                            </p>
                          </div>
                          <AnalyticsColumn row={report} />
                        </Card>
                      </Link>
                    ))}
                  </Tab.Pane>
                ))}
              </Tab.Content>
            </div>
          </Tab.Container>
        </Card.Body>
      </Card>
    </>
  );
};
