import { FC } from 'react';
import { PlanUsageResponse } from 'waldur-js-client';

import { translate } from '@/i18n';
import { isExperimentalUiComponentsVisible } from '@/marketplace/utils';

import {
  AnalyticsCapability,
  AnalyticsMode,
  createSimulationResult,
  DrillDownDataItem,
  SimulationParam,
  SimulationResult,
  AnalyticsButtons,
} from '../analytics';

/**
 * Simulation parameters for Capacity "What if" analysis
 */
const capacitySimulationParams: SimulationParam[] = [
  {
    id: 'usageGrowthPercent',
    label: translate('Usage growth'),
    description: translate('Projected increase in active subscriptions'),
    type: 'slider',
    defaultValue: 0,
    min: -50,
    max: 100,
    step: 5,
    unit: '%',
  },
  {
    id: 'limitChangePercent',
    label: translate('Limit adjustment'),
    description: translate('Change capacity limits by percentage'),
    type: 'slider',
    defaultValue: 0,
    min: -50,
    max: 100,
    step: 5,
    unit: '%',
  },
  {
    id: 'safetyMargin',
    label: translate('Safety margin'),
    description: translate('Minimum remaining capacity to maintain'),
    type: 'number',
    defaultValue: 10,
    min: 0,
    max: 100,
    step: 1,
    unit: '%',
  },
];

/**
 * Calculate simulation results for Capacity "What if" analysis
 * Uses REAL data from PlanUsageResponse
 */
function calculateCapacitySimulation(
  params: Record<string, number | string>,
  data: unknown,
): SimulationResult[] {
  const planUsages = data as PlanUsageResponse[];
  if (!planUsages || planUsages.length === 0) return [];

  const usageGrowth = Number(params.usageGrowthPercent) / 100;
  const limitChange = Number(params.limitChangePercent) / 100;
  const safetyMargin = Number(params.safetyMargin) / 100;

  // Aggregate current values
  let totalUsage = 0;
  let totalLimit = 0;
  let plansAtRisk = 0;

  planUsages.forEach((plan) => {
    totalUsage += plan.usage;
    if (plan.limit) {
      totalLimit += plan.limit;
      // Check if remaining capacity is below safety margin
      const remaining = plan.limit - plan.usage;
      const remainingPercent = plan.limit > 0 ? remaining / plan.limit : 1;
      if (remainingPercent < safetyMargin) {
        plansAtRisk++;
      }
    }
  });

  // Calculate projected values
  const projectedUsage = Math.round(totalUsage * (1 + usageGrowth));
  const projectedLimit = Math.round(totalLimit * (1 + limitChange));
  const projectedRemaining = projectedLimit - projectedUsage;

  // Calculate plans at risk with new parameters
  let projectedPlansAtRisk = 0;
  planUsages.forEach((plan) => {
    if (plan.limit) {
      const newUsage = Math.round(plan.usage * (1 + usageGrowth));
      const newLimit = Math.round(plan.limit * (1 + limitChange));
      const newRemaining = newLimit - newUsage;
      const newRemainingPercent = newLimit > 0 ? newRemaining / newLimit : 1;
      if (newRemainingPercent < safetyMargin) {
        projectedPlansAtRisk++;
      }
    }
  });

  // Calculate utilization percentages
  const currentUtilization =
    totalLimit > 0 ? (totalUsage / totalLimit) * 100 : 0;
  const projectedUtilization =
    projectedLimit > 0 ? (projectedUsage / projectedLimit) * 100 : 0;

  return [
    createSimulationResult(
      'total-usage',
      translate('Total active subscriptions'),
      totalUsage,
      projectedUsage,
    ),
    createSimulationResult(
      'total-limit',
      translate('Total capacity'),
      totalLimit,
      projectedLimit,
    ),
    createSimulationResult(
      'total-remaining',
      translate('Available capacity'),
      totalLimit - totalUsage,
      projectedRemaining,
    ),
    createSimulationResult(
      'utilization',
      translate('Utilization rate'),
      Math.round(currentUtilization),
      Math.round(projectedUtilization),
      '%',
    ),
    createSimulationResult(
      'plans-at-risk',
      translate('Plans below safety margin'),
      plansAtRisk,
      projectedPlansAtRisk,
    ),
  ];
}

/**
 * Transform PlanUsageResponse data for drill-down analysis
 */
export function transformToDrillDownData(
  planUsages: PlanUsageResponse[],
  groupBy: 'provider' | 'offering' | 'plan',
): DrillDownDataItem[] {
  const grouped = new Map<
    string,
    { label: string; total: number; items: PlanUsageResponse[] }
  >();

  planUsages.forEach((plan) => {
    let key: string;
    let label: string;

    switch (groupBy) {
      case 'provider':
        key = plan.customer_provider_uuid;
        label = plan.customer_provider_name;
        break;
      case 'offering':
        key = plan.offering_uuid;
        label = plan.offering_name;
        break;
      case 'plan':
        key = `${plan.offering_uuid}-${plan.plan_name}`;
        label = plan.plan_name;
        break;
    }

    if (!grouped.has(key)) {
      grouped.set(key, { label, total: 0, items: [] });
    }
    const group = grouped.get(key)!;
    group.total += plan.usage;
    group.items.push(plan);
  });

  const totalUsage = Array.from(grouped.values()).reduce(
    (sum, g) => sum + g.total,
    0,
  );

  return Array.from(grouped.entries())
    .map(([id, { label, total, items }]) => ({
      id,
      label,
      value: total,
      percentage: totalUsage > 0 ? (total / totalUsage) * 100 : 0,
      canDrillDown: groupBy !== 'plan',
      metadata: {
        itemCount: items.length,
        items,
      },
    }))
    .sort((a, b) => b.value - a.value);
}

/**
 * Analytics capability configuration for Capacity report
 * Uses REAL data from Plan Usage Statistics API
 */
export function getCapacityAnalyticsCapability(
  planUsages: PlanUsageResponse[],
): AnalyticsCapability {
  return {
    supportedModes: ['what-if', 'why-so'],
    simulationParams: capacitySimulationParams,
    calculateSimulation: calculateCapacitySimulation,
    initialDimension: translate('Service Provider'),
    drillDownPaths: [
      {
        from: translate('Service Provider'),
        to: translate('Offering'),
        dimension: 'provider',
        fetchData: (providerId: string) => {
          // Filter plans by provider and group by offering
          const providerPlans = planUsages.filter(
            (p) => p.customer_provider_uuid === providerId,
          );
          return Promise.resolve(
            transformToDrillDownData(providerPlans, 'offering'),
          );
        },
      },
      {
        from: translate('Offering'),
        to: translate('Plan'),
        dimension: 'offering',
        fetchData: (offeringId: string) => {
          // Filter plans by offering and show individual plans
          const offeringPlans = planUsages.filter(
            (p) => p.offering_uuid === offeringId,
          );
          return Promise.resolve(
            transformToDrillDownData(offeringPlans, 'plan'),
          );
        },
      },
    ],
  };
}

interface PlanUsageAnalyticsProps {
  /** All loaded plan usage data */
  data: PlanUsageResponse[];
  /** Whether data is still loading */
  loading?: boolean;
}

const supportedModes: AnalyticsMode[] = ['what-if', 'why-so'];

/**
 * Buttons component that navigates to the Capacity Analytics page with specific mode.
 * Only visible when experimental UI components are enabled.
 */
export const PlanUsageAnalytics: FC<PlanUsageAnalyticsProps> = ({
  data,
  loading,
}) => {
  const showExperimental = isExperimentalUiComponentsVisible();

  if (!showExperimental) {
    return null;
  }

  const isDisabled = loading || data.length === 0;

  return (
    <AnalyticsButtons
      state="reporting-capacity-analytics"
      supportedModes={supportedModes}
      isDisabled={isDisabled}
      name="capacity"
    />
  );
};
