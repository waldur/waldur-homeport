import { useCurrentStateAndParams } from '@uirouter/react';
import { FC, useMemo, useState } from 'react';

import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { titleCase } from '@/core/utils';
import { translate } from '@/i18n';
import { getLabel } from '@/marketplace/common/registry';

import {
  AnalyticsMode,
  AnalyticsPageContent,
  DrillDownDataItem,
  DrillDownPath,
  SimulationParam,
  SimulationResult,
  createSimulationResult,
} from '../analytics';
import { ReportingTitle } from '../ReportingTitle';

import { useResourceDemandStats } from './hooks';
import { ResourceDemandStat } from './types';

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
  const resources = data as ResourceDemandStat[];
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

  // Projected values
  const projectedRequests = Math.round(totalRequests * (1 + demandGrowthRate));
  const maxApprovable = Math.round(
    (totalApproved + totalPending) * capacityMultiplier,
  );
  const projectedApproved = Math.min(
    Math.round(projectedRequests * targetApprovalRate),
    maxApprovable,
  );
  const actualProjectedApprovalRate = projectedApproved / projectedRequests;

  // Unmet demand
  const currentUnmet = totalRequests - totalApproved;
  const projectedUnmet = projectedRequests - projectedApproved;

  const results = [
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
  ];

  // Dynamic resource fulfillment
  const allResourceKeys = new Set<string>();
  resources.forEach((r) => {
    Object.keys(r.total_requested_limits).forEach((key) =>
      allResourceKeys.add(key),
    );
  });

  const sortedKeys = Array.from(allResourceKeys).sort();

  sortedKeys.forEach((key) => {
    let totalRequestedKey = 0;
    let totalApprovedKey = 0;

    resources.forEach((r) => {
      totalRequestedKey += r.total_requested_limits[key] || 0;
      totalApprovedKey += r.total_approved_limits[key] || 0;
    });

    if (totalRequestedKey > 0) {
      const projectedRequestedKey = Math.round(
        totalRequestedKey * (1 + demandGrowthRate),
      );
      const projectedApprovedKey = Math.round(
        totalApprovedKey * capacityMultiplier * (1 + demandGrowthRate * 0.5),
      );

      results.push(
        createSimulationResult(
          `${key}-fulfilled`,
          translate('{resource} fulfilled', {
            resource: titleCase(key.replace(/_/g, ' ')),
          }),
          Math.round((totalApprovedKey / totalRequestedKey) * 100),
          Math.round((projectedApprovedKey / projectedRequestedKey) * 100),
          '%',
        ),
      );
    }
  });

  return results;
}

/**
 * Transform resource data for drill-down analysis by offering type
 */
function transformResourcesToDrillDownByType(
  resources: ResourceDemandStat[],
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
      label: getLabel(type),
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
          'up' | 'down',
      },
    }))
    .sort((a, b) => b.value - a.value);
}

/**
 * Generate drill-down data for offerings within a type
 */
function getOfferingsByType(
  resources: ResourceDemandStat[],
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
  resources: ResourceDemandStat[],
): any {
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
  const { params } = useCurrentStateAndParams();
  const initialMode = (params.mode as AnalyticsMode) || 'what-if';
  const [activeMode, setActiveMode] = useState<AnalyticsMode>(initialMode);

  const { data, isLoading, error, refetch } = useResourceDemandStats();
  const resources = data || [];

  if (isLoading) return <LoadingSpinner />;
  if (error) return <LoadingErred loadData={refetch} />;

  const capability = useMemo(
    () => getResourceDemandAnalyticsCapability(resources),
    [resources],
  );
  const drillDownData = useMemo(
    () => transformResourcesToDrillDownByType(resources),
    [resources],
  );

  const breadcrumbs = useMemo(
    () => [{ key: 'analytics', text: translate('Analytics'), active: true }],
    [],
  );

  return (
    <>
      <ReportingTitle
        reportKey="reporting-resource-demand-analytics"
        backState="reporting-resource-demand"
        additionalBreadcrumbs={breadcrumbs}
      />

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
