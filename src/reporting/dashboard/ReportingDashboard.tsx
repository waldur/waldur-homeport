import {
  BuildingsIcon,
  ChartLineUpIcon,
  CheckCircleIcon,
  ClipboardTextIcon,
  CubeIcon,
  CurrencyCircleDollarIcon,
  FileTextIcon,
  FlagIcon,
  FlaskIcon,
  FolderIcon,
  GaugeIcon,
  GraduationCapIcon,
  LightbulbIcon,
  ListBulletsIcon,
  PackageIcon,
  ShoppingCartIcon,
  StackIcon,
  TagIcon,
  TrendUpIcon,
  UsersIcon,
  UsersThreeIcon,
  WarningCircleIcon,
  WrenchIcon,
} from '@phosphor-icons/react';
import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
import {
  FC,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Nav, Tab } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import { Badge } from '@waldur/core/Badge';
import { Link } from '@waldur/core/Link';
import { Tip } from '@waldur/core/Tooltip';
import { isFeatureVisible } from '@waldur/features/connect';
import { MarketplaceFeatures, SupportFeatures } from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';
import { isExperimentalUiComponentsVisible } from '@waldur/marketplace/utils';
import Table from '@waldur/table/Table';
import { Column } from '@waldur/table/types';
import {
  hasAnyOrganizationAccess,
  isServiceProviderManager,
  isStaffOrSupport,
} from '@waldur/workspace/selectors';

import { AnalyticsMode } from '../analytics';

interface ReportItem {
  uuid: string;
  icon: ReactNode;
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

const ReportColumn = ({ row }: { row: ReportItem }) => (
  <Link state={row.state} className="d-flex align-items-center text-gray-800">
    <span className="text-primary me-2">{row.icon}</span>
    <span className="fw-semibold">{row.title}</span>
  </Link>
);

const DescriptionColumn = ({ row }: { row: ReportItem }) => (
  <span className="text-muted">{row.description}</span>
);

const AnalyticsColumn = ({ row }: { row: ReportItem }) => {
  if (!row.analytics || row.analytics.length === 0 || !row.analyticsState) {
    return <span className="text-muted">—</span>;
  }

  const hasWhatIf = row.analytics.includes('what-if');
  const hasWhySo = row.analytics.includes('why-so');

  return (
    <div className="d-flex gap-2">
      {hasWhatIf && (
        <Tip id={`${row.uuid}-whatif`} label={translate('What-If analysis')}>
          <Link state={row.analyticsState} params={{ mode: 'what-if' }}>
            <Badge
              variant="primary"
              leftIcon={<FlaskIcon weight="bold" />}
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
              variant="success"
              leftIcon={<LightbulbIcon weight="bold" />}
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

const getColumns = (showExperimental: boolean): Column<ReportItem>[] => {
  const cols: Column<ReportItem>[] = [
    {
      title: translate('Report'),
      render: ReportColumn,
    },
    {
      title: translate('Description'),
      render: DescriptionColumn,
    },
  ];
  if (showExperimental) {
    cols.push({
      title: translate('Analytics'),
      render: AnalyticsColumn,
    });
  }
  return cols;
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

  const columns = useMemo(
    () => getColumns(showExperimental),
    [showExperimental],
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
            icon: <ChartLineUpIcon size={18} weight="bold" />,
            title: translate('Usage'),
            description: translate(
              'Resource usage metrics across organizations',
            ),
            state: 'reporting-resource-usage',
          },
          {
            uuid: 'user-usage',
            icon: <UsersIcon size={18} weight="bold" />,
            title: translate('Usage by user'),
            description: translate('Usage metrics broken down by user'),
            state: 'reporting-user-usage',
          },
          withAnalytics(
            {
              uuid: 'quotas',
              icon: <GaugeIcon size={18} weight="bold" />,
              title: translate('Quotas'),
              description: translate('Organization quota limits and usage'),
              state: 'reporting-quotas',
            },
            ['what-if', 'why-so'],
            'reporting-quotas-analytics',
          ),
          {
            uuid: 'usage-monitoring',
            icon: <WarningCircleIcon size={18} weight="bold" />,
            title: translate('Usage monitoring'),
            description: translate('Detect missing or anomalous usage reports'),
            state: 'reporting-usage-monitoring',
          },
          {
            uuid: 'usage-trends',
            icon: <TrendUpIcon size={18} weight="bold" />,
            title: translate('Usage trends'),
            description: translate('Year-over-year usage analysis and growth'),
            state: 'reporting-usage-trends',
          },
          {
            uuid: 'organization-summary',
            icon: <BuildingsIcon size={18} weight="bold" />,
            title: translate('Organization summary'),
            description: translate(
              'Resources, limits, and usage by organization',
            ),
            state: 'reporting-organization-summary',
          },
          {
            uuid: 'project-detail',
            icon: <FolderIcon size={18} weight="bold" />,
            title: translate('Project detail'),
            description: translate(
              'Resource limit and usage history over time',
            ),
            state: 'reporting-project-detail',
          },
          {
            uuid: 'resources-geography',
            icon: <FlagIcon size={18} weight="bold" />,
            title: translate('Geographic distribution'),
            description: translate(
              'Resources by country, organization group, and offering',
            ),
            state: 'reporting-resources-geography',
          },
          {
            uuid: 'project-classification',
            icon: <GraduationCapIcon size={18} weight="bold" />,
            title: translate('Project classification'),
            description: translate(
              'Project usage by OECD code and industry classification',
            ),
            state: 'reporting-project-classification',
          },
          {
            uuid: 'usage-by-customer',
            icon: <BuildingsIcon size={18} weight="bold" />,
            title: translate('Usage by customer'),
            description: translate(
              'Full resource breakdown per customer with usages, limits, and costs',
            ),
            state: 'reporting-usage-by-customer',
          },
          {
            uuid: 'usage-by-org-type',
            icon: <TagIcon size={18} weight="bold" />,
            title: translate('Usage by organization type'),
            description: translate(
              'Resource usage grouped by creator organization type',
            ),
            state: 'reporting-usage-by-org-type',
          },
          {
            uuid: 'usage-by-creator',
            icon: <UsersIcon size={18} weight="bold" />,
            title: translate('Usage by creator'),
            description: translate(
              'Resource usage by creator affiliations and organization type',
            ),
            state: 'reporting-usage-by-creator',
          },
        ],
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
              icon: <ChartLineUpIcon size={18} weight="bold" />,
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
              icon: <ClipboardTextIcon size={18} weight="bold" />,
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
              icon: <PackageIcon size={18} weight="bold" />,
              title: translate('Resource demand'),
              description: translate('Resources requested through proposals'),
              state: 'reporting-resource-demand',
            },
            ['what-if', 'why-so'],
            'reporting-resource-demand-analytics',
          ),
        ],
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
              icon: <CubeIcon size={18} weight="bold" />,
              title: translate('Capacity'),
              description: translate('Available capacity of offering plans'),
              state: 'reporting-capacity',
            },
            ['what-if', 'why-so'],
            'reporting-capacity-analytics',
          ),
          {
            uuid: 'provider-overview',
            icon: <GaugeIcon size={18} weight="bold" />,
            title: translate('Provider overview'),
            description: translate('KPI dashboard with key provider metrics'),
            state: 'reporting-provider-overview',
          },
          {
            uuid: 'provider-revenue',
            icon: <CurrencyCircleDollarIcon size={18} weight="bold" />,
            title: translate('Provider revenue'),
            description: translate('Monthly revenue trends for provider'),
            state: 'reporting-provider-revenue',
          },
          {
            uuid: 'provider-orders',
            icon: <ShoppingCartIcon size={18} weight="bold" />,
            title: translate('Provider orders'),
            description: translate('Order statistics and trends for provider'),
            state: 'reporting-provider-orders',
          },
          {
            uuid: 'provider-resources',
            icon: <StackIcon size={18} weight="bold" />,
            title: translate('Provider resources'),
            description: translate('Resource statistics by state and offering'),
            state: 'reporting-provider-resources',
          },
          {
            uuid: 'provider-customers',
            icon: <UsersThreeIcon size={18} weight="bold" />,
            title: translate('Provider customers'),
            description: translate('Customer acquisition and top customers'),
            state: 'reporting-provider-customers',
          },
          {
            uuid: 'provider-offerings',
            icon: <PackageIcon size={18} weight="bold" />,
            title: translate('Provider offerings'),
            description: translate('Offering performance metrics'),
            state: 'reporting-provider-offerings',
          },
          {
            uuid: 'openstack-instances',
            icon: <StackIcon size={18} weight="bold" />,
            title: translate('OpenStack instances'),
            description: translate(
              'OpenStack instance inventory and aggregated metrics',
            ),
            state: 'reporting-openstack-instances',
          },
        ],
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
              icon: <UsersThreeIcon size={18} weight="bold" />,
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
            icon: <BuildingsIcon size={18} weight="bold" />,
            title: translate('Organizations'),
            description: translate(
              'User distribution by organization membership',
            ),
            state: 'reporting-user-organizations',
          },
          {
            uuid: 'user-affiliations',
            icon: <TagIcon size={18} weight="bold" />,
            title: translate('Affiliations'),
            description: translate(
              'User distribution by affiliation type (faculty, student, staff, etc.)',
            ),
            state: 'reporting-user-affiliations',
          },
          {
            uuid: 'user-roles',
            icon: <UsersIcon size={18} weight="bold" />,
            title: translate('Role distribution'),
            description: translate('Member counts per organization'),
            state: 'reporting-user-roles',
          },
        ],
      });
    }

    if (showPlatform) {
      // Financial category (renamed from Platform)
      const financialReports: ReportItem[] = [
        {
          uuid: 'growth',
          icon: <ChartLineUpIcon size={18} weight="bold" />,
          title: translate('Growth'),
          description: translate('Monthly revenue changes over time'),
          state: 'reporting-growth',
        },
        {
          uuid: 'monthly-revenue',
          icon: <ListBulletsIcon size={18} weight="bold" />,
          title: translate('Monthly revenue'),
          description: translate('Revenue breakdown by organization'),
          state: 'reporting-revenue',
        },
      ];

      if (showPricelist) {
        financialReports.push({
          uuid: 'pricelist',
          icon: <FileTextIcon size={18} weight="bold" />,
          title: translate('Pricelist'),
          description: translate('Marketplace offering prices'),
          state: 'reporting-pricelist',
        });
      }

      financialReports.push({
        uuid: 'orders',
        icon: <ShoppingCartIcon size={18} weight="bold" />,
        title: translate('Orders'),
        description: translate('Daily order trends and status distribution'),
        state: 'reporting-orders',
      });

      financialReports.push({
        uuid: 'offering-costs',
        icon: <CurrencyCircleDollarIcon size={18} weight="bold" />,
        title: translate('Offering costs'),
        description: translate('Cost metrics per offering'),
        state: 'reporting-offering-costs',
      });

      result.push({
        key: 'financial',
        title: translate('Financial'),
        reports: financialReports,
      });

      // Infrastructure category
      if (showVmOverview) {
        result.push({
          key: 'infrastructure',
          title: translate('Infrastructure'),
          reports: [
            {
              uuid: 'vm-type-overview',
              icon: <CubeIcon size={18} weight="bold" />,
              title: translate('VM type overview'),
              description: translate('Virtual machine types across platform'),
              state: 'reporting-vm-overview',
            },
          ],
        });
      }

      // Operations category
      result.push({
        key: 'operations',
        title: translate('Operations'),
        reports: [
          {
            uuid: 'maintenance-overview',
            icon: <WrenchIcon size={18} weight="bold" />,
            title: translate('Maintenance overview'),
            description: translate(
              'Cross-provider maintenance analytics and timeline',
            ),
            state: 'reporting-maintenance-overview',
          },
          {
            uuid: 'provisioning-stats',
            icon: <CheckCircleIcon size={18} weight="bold" />,
            title: translate('Provisioning statistics'),
            description: translate(
              'Order success rates and provisioning trends',
            ),
            state: 'reporting-provisioning-stats',
          },
        ],
      });
    }

    return result;
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

  const noop = useCallback(() => {}, []);

  if (categories.length === 0) {
    return null;
  }

  const tabs = useMemo(
    () => (
      <Tab.Container activeKey={activeKey} onSelect={(k) => setActiveKey(k)}>
        <div className="overflow-auto flex-grow-1 pb-2 pt-4">
          <Nav
            variant="tabs"
            className="nav-line-tabs flex-nowrap mx-0 border-0"
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
        </div>
      </Tab.Container>
    ),
    [activeKey, categoriesWithCounts],
  );

  return (
    <Table
      title={translate('Reporting')}
      columns={columns}
      rows={filteredReports}
      fetch={noop}
      loading={false}
      error={null}
      activeColumns={{}}
      columnPositions={[]}
      resetSelection={noop}
      setFilterPosition={noop}
      initColumnPositions={noop}
      resetPagination={noop}
      hasPagination={false}
      filters={tabs}
      filterPosition="header"
      hasQuery
      query={query}
      setQuery={setQuery}
      verboseName={translate('reports')}
      standalone
      hideRefresh
      cardBordered
    />
  );
};
