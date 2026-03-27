import { useCurrentStateAndParams } from '@uirouter/react';
import { FC, useMemo, useState } from 'react';

import { Link } from '@waldur/core/Link';
import { PublicDashboardHero } from '@waldur/dashboard/hero/PublicDashboardHero';
import { translate } from '@waldur/i18n';
import { useTitle } from '@waldur/navigation/title';

import {
  AnalyticsCapability,
  AnalyticsMode,
  AnalyticsPageContent,
  createSimulationResult,
  DrillDownDataItem,
  DrillDownPath,
  SimulationParam,
  SimulationResult,
} from '../analytics';
import { useReportBreadcrumbs } from '../ReportsBreadcrumbs';

import { generateResourceDemandData } from './mockData';
import { ResourceDemandData } from './types';

/**
 * Simulation parameters for Resource Demand "What if" analysis
 */
const resourceDemandSimulationParams: SimulationParam[] = [
  {
    id: 'demandGrowth',
    label: translate('Demand growth'),
    description: translate('Expected change in resource requests'),
    type: 'slider',
    defaultValue: 0,
    min: -20,
    max: 50,
    step: 5,
    unit: '%',
  },
  {
    id: 'approvalRateTarget',
    label: translate('Target approval rate'),
    description: translate('Desired approval rate for requests'),
    type: 'slider',
    defaultValue: 75,
    min: 50,
    max: 95,
    step: 5,
    unit: '%',
  },
  {
    id: 'capacityExpansion',
    label: translate('Capacity expansion'),
    description: translate('Increase in available capacity'),
    type: 'select',
    defaultValue: 'none',
    options: [
      { value: 'none', label: translate('No expansion') },
      { value: 'moderate', label: translate('Moderate (+20%)') },
      { value: 'significant', label: translate('Significant (+50%)') },
      { value: 'major', label: translate('Major (+100%)') },
    ],
  },
];

const CAPACITY_MULTIPLIERS: Record<string, number> = {
  none: 1.0,
  moderate: 1.2,
  significant: 1.5,
  major: 2.0,
};

/**
 * Calculate simulation results for Resource Demand "What if" analysis
 */
function calculateResourceDemandSimulation(
  params: Record<string, number | string>,
  data: unknown,
): SimulationResult[] {
  const resources = data as ResourceDemandData[];
  if (!resources || resources.length === 0) return [];

  const demandGrowthRate = Number(params.demandGrowth) / 100;
  const targetApprovalRate = Number(params.approvalRateTarget) / 100;
  const capacityMultiplier =
    CAPACITY_MULTIPLIERS[params.capacityExpansion as string] || 1.0;

  // Current totals
  const totalRequests = resources.reduce((sum, r) => sum + r.request_count, 0);
  const totalApproved = resources.reduce((sum, r) => sum + r.approved_count, 0);
  const totalPending = resources.reduce((sum, r) => sum + r.pending_count, 0);
  const currentApprovalRate = totalApproved / (totalApproved + totalPending);

  // Sum key resource limits
  let totalCpuRequested = 0;
  let totalStorageRequested = 0;
  let totalCpuApproved = 0;
  let totalStorageApproved = 0;

  resources.forEach((r) => {
    Object.entries(r.total_requested_limits).forEach(([key, value]) => {
      if (key.includes('cpu') || key.includes('vcpu')) {
        totalCpuRequested += value;
      }
      if (key.includes('storage') || key.includes('gb') || key.includes('tb')) {
        totalStorageRequested += value;
      }
    });
    Object.entries(r.total_approved_limits).forEach(([key, value]) => {
      if (key.includes('cpu') || key.includes('vcpu')) {
        totalCpuApproved += value;
      }
      if (key.includes('storage') || key.includes('gb') || key.includes('tb')) {
        totalStorageApproved += value;
      }
    });
  });

  // Projected values
  const projectedRequests = Math.round(totalRequests * (1 + demandGrowthRate));
  const projectedDemandCpu = Math.round(
    totalCpuRequested * (1 + demandGrowthRate),
  );
  const projectedDemandStorage = Math.round(
    totalStorageRequested * (1 + demandGrowthRate),
  );

  // Projected approvals based on target rate and capacity
  const maxApprovable = Math.round(
    (totalApproved + totalPending) * capacityMultiplier,
  );
  const projectedApproved = Math.min(
    Math.round(projectedRequests * targetApprovalRate),
    maxApprovable,
  );
  const actualProjectedApprovalRate = projectedApproved / projectedRequests;

  // Resource fulfillment
  const projectedCpuApproved = Math.round(
    totalCpuApproved * capacityMultiplier * (1 + demandGrowthRate * 0.5),
  );
  const projectedStorageApproved = Math.round(
    totalStorageApproved * capacityMultiplier * (1 + demandGrowthRate * 0.5),
  );

  // Unmet demand
  const currentUnmet = totalRequests - totalApproved;
  const projectedUnmet = projectedRequests - projectedApproved;

  return [
    createSimulationResult(
      'total-requests',
      translate('Total requests'),
      totalRequests,
      projectedRequests,
    ),
    createSimulationResult(
      'approved',
      translate('Approved requests'),
      totalApproved,
      projectedApproved,
    ),
    createSimulationResult(
      'approval-rate',
      translate('Approval rate'),
      Math.round(currentApprovalRate * 100),
      Math.round(actualProjectedApprovalRate * 100),
      '%',
    ),
    createSimulationResult(
      'unmet-demand',
      translate('Unmet demand'),
      currentUnmet,
      projectedUnmet,
    ),
    createSimulationResult(
      'cpu-fulfilled',
      translate('Compute fulfilled'),
      Math.round((totalCpuApproved / totalCpuRequested) * 100),
      Math.round((projectedCpuApproved / projectedDemandCpu) * 100),
      '%',
    ),
    createSimulationResult(
      'storage-fulfilled',
      translate('Storage fulfilled'),
      Math.round((totalStorageApproved / totalStorageRequested) * 100),
      Math.round((projectedStorageApproved / projectedDemandStorage) * 100),
      '%',
    ),
  ];
}

/**
 * Transform resource data for drill-down analysis by offering type
 */
function transformResourcesToDrillDownByType(
  resources: ResourceDemandData[],
): DrillDownDataItem[] {
  // Group by offering type
  const byType = new Map<string, { requests: number; approved: number }>();

  resources.forEach((r) => {
    const existing = byType.get(r.offering_type) || {
      requests: 0,
      approved: 0,
    };
    byType.set(r.offering_type, {
      requests: existing.requests + r.request_count,
      approved: existing.approved + r.approved_count,
    });
  });

  const totalRequests = resources.reduce((sum, r) => sum + r.request_count, 0);

  return Array.from(byType.entries())
    .map(([type, data]) => ({
      id: type,
      label: type,
      value: data.requests,
      percentage: totalRequests > 0 ? (data.requests / totalRequests) * 100 : 0,
      canDrillDown: true,
      metadata: {
        approvedCount: data.approved,
        approvalRate:
          data.requests > 0
            ? Math.round((data.approved / data.requests) * 100)
            : 0,
      },
      change: {
        value: data.approved,
        percent: Math.round((data.approved / data.requests) * 100 - 70),
        direction: (data.approved / data.requests >= 0.7 ? 'up' : 'down') as
          | 'up'
          | 'down',
      },
    }))
    .sort((a, b) => b.value - a.value);
}

/**
 * Generate drill-down data for offerings within a type
 */
function getOfferingsByType(
  resources: ResourceDemandData[],
  offeringType: string,
): DrillDownDataItem[] {
  const filtered = resources.filter((r) => r.offering_type === offeringType);
  const totalRequests = filtered.reduce((sum, r) => sum + r.request_count, 0);

  return filtered
    .map((r) => ({
      id: r.offering_uuid,
      label: r.offering_name,
      value: r.request_count,
      percentage:
        totalRequests > 0 ? (r.request_count / totalRequests) * 100 : 0,
      canDrillDown: false,
      metadata: {
        provider: r.provider_name,
        approved: r.approved_count,
        pending: r.pending_count,
      },
    }))
    .sort((a, b) => b.value - a.value);
}

function getResourceDemandAnalyticsCapability(
  resources: ResourceDemandData[],
): AnalyticsCapability {
  const drillDownPaths: DrillDownPath[] = [
    {
      from: translate('Offering type'),
      to: translate('Offering'),
      dimension: 'type',
      fetchData: (offeringType: string) =>
        Promise.resolve(getOfferingsByType(resources, offeringType)),
    },
  ];

  return {
    supportedModes: ['what-if', 'why-so'],
    simulationParams: resourceDemandSimulationParams,
    calculateSimulation: calculateResourceDemandSimulation,
    initialDimension: translate('Offering type'),
    drillDownPaths,
    whatIfDataSource: 'mocked',
    whatIfDataSourceDescription: translate(
      'Projections simulate demand growth and capacity expansion scenarios.',
    ),
    whySoDataSource: 'mocked',
    whySoDataSourceDescription: translate(
      'Drill-down shows resource requests grouped by offering type and provider.',
    ),
  };
}

const modeConfig: Record<
  AnalyticsMode,
  { label: string; description: string }
> = {
  'what-if': {
    label: translate('What if'),
    description: translate(
      'Simulate how demand growth and capacity expansion affect resource fulfillment',
    ),
  },
  'why-so': {
    label: translate('Why so'),
    description: translate(
      'Identify root causes by drilling down into specific offering types and providers',
    ),
  },
};

export const ResourceDemandAnalyticsPage: FC = () => {
  useTitle(translate('Resource Demand Analysis'));

  const { params } = useCurrentStateAndParams();
  const initialMode = (params.mode as AnalyticsMode) || 'what-if';
  const [activeMode, setActiveMode] = useState<AnalyticsMode>(initialMode);

  const resources = useMemo(() => generateResourceDemandData(), []);
  const capability = useMemo(
    () => getResourceDemandAnalyticsCapability(resources),
    [resources],
  );
  const drillDownData = useMemo(
    () => transformResourcesToDrillDownByType(resources),
    [resources],
  );

  useReportBreadcrumbs({
    currentReport: 'resource-demand',
    category: 'proposals',
    additionalItems: [
      { key: 'analytics', text: translate('Analytics'), active: true },
    ],
  });

  return (
    <>
      <PublicDashboardHero
        containerClassName="mb-5"
        cardBordered
        hideQuickSection
        title={translate('Resource Demand Analysis')}
        actions={
          <Link
            state="reporting-resource-demand"
            className="btn btn-light btn-sm"
          >
            {translate('Back to Resource Demand')}
          </Link>
        }
      >
        <p className="text-muted mb-0">
          {translate(
            'Analyze resource requests and explore capacity planning scenarios.',
          )}
        </p>
      </PublicDashboardHero>

      <AnalyticsPageContent
        activeMode={activeMode}
        setActiveMode={setActiveMode}
        capability={capability}
        data={resources}
        drillDownData={drillDownData}
        modeConfig={modeConfig}
      />
    </>
  );
};
