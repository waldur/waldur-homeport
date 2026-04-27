import { useCurrentStateAndParams } from '@uirouter/react';
import { FC, useMemo, useState } from 'react';

import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';

import {
  AnalyticsCapability,
  AnalyticsMode,
  AnalyticsPageContent,
  createSimulationResult,
  DrillDownDataItem,
  SimulationParam,
  SimulationResult,
} from '../analytics';
import { ReportingTitle } from '../ReportingTitle';

import { UserStatistics } from './types';
import {
  computeStatisticsSummary,
  useUserStatistics,
} from './useUserStatistics';

/**
 * Simulation parameters for User Demographics "What if" analysis
 */
const demographicsSimulationParams: SimulationParam[] = [
  {
    id: 'userGrowthPercent',
    label: translate('User growth'),
    description: translate('Expected user growth rate'),
    type: 'slider',
    defaultValue: 10,
    min: 0,
    max: 100,
    step: 5,
    unit: '%',
  },
  {
    id: 'federationAdoptionPercent',
    label: translate('Federation adoption'),
    description: translate('Shift of users to federated authentication'),
    type: 'slider',
    defaultValue: 0,
    min: -20,
    max: 50,
    step: 5,
    unit: '%',
  },
  {
    id: 'growthSource',
    label: translate('Growth source'),
    description: translate('Primary source of new users'),
    type: 'select',
    defaultValue: 'balanced',
    options: [
      { value: 'balanced', label: translate('Balanced growth') },
      { value: 'federated', label: translate('Federated (AAI)') },
      { value: 'local', label: translate('Local accounts') },
    ],
  },
];

/**
 * Calculate simulation results for User Demographics "What if" analysis
 */
function calculateDemographicsSimulation(
  params: Record<string, number | string>,
  data: unknown,
): SimulationResult[] {
  const stats = data as UserStatistics;
  if (!stats) return [];

  const summary = computeStatisticsSummary(stats);
  const growthRate = Number(params.userGrowthPercent) / 100;
  const federationShift = Number(params.federationAdoptionPercent) / 100;
  const growthSource = params.growthSource as string;

  // Calculate projected total users
  const projectedTotal = Math.round(summary.totalUsers * (1 + growthRate));

  // Calculate new users
  const newUsers = projectedTotal - summary.totalUsers;

  // Determine how new users are distributed based on growth source
  let newFederated = 0;
  let newLocal = 0;
  const localUsers = summary.totalUsers - summary.federatedUsers;

  switch (growthSource) {
    case 'federated':
      newFederated = Math.round(newUsers * 0.8);
      newLocal = newUsers - newFederated;
      break;
    case 'local':
      newLocal = Math.round(newUsers * 0.8);
      newFederated = newUsers - newLocal;
      break;
    default: // balanced
      newFederated = Math.round(newUsers * 0.5);
      newLocal = newUsers - newFederated;
  }

  // Apply federation shift to existing users
  const shiftedUsers = Math.round(localUsers * federationShift);

  const projectedFederated =
    summary.federatedUsers + newFederated + shiftedUsers;
  const projectedLocal = localUsers + newLocal - shiftedUsers;

  const projectedFederatedPercent =
    projectedTotal > 0
      ? Math.round((projectedFederated / projectedTotal) * 100)
      : 0;

  return [
    createSimulationResult(
      'total-users',
      translate('Total users'),
      summary.totalUsers,
      projectedTotal,
    ),
    createSimulationResult(
      'federated-users',
      translate('Federated users'),
      summary.federatedUsers,
      projectedFederated,
    ),
    createSimulationResult(
      'local-users',
      translate('Local users'),
      localUsers,
      projectedLocal,
    ),
    createSimulationResult(
      'federation-percent',
      translate('Federation rate'),
      summary.federatedPercent,
      projectedFederatedPercent,
      '%',
    ),
    createSimulationResult(
      'identity-sources',
      translate('Identity sources'),
      summary.identitySourceCount,
      // Assume slight increase in identity sources with more federated users
      Math.round(
        summary.identitySourceCount *
          (1 + (projectedFederated > summary.federatedUsers ? 0.1 : 0)),
      ),
    ),
  ];
}

function getDemographicsAnalyticsCapability(): AnalyticsCapability {
  return {
    supportedModes: ['what-if', 'why-so'],
    simulationParams: demographicsSimulationParams,
    calculateSimulation: calculateDemographicsSimulation,
    initialDimension: translate('Authentication method'),
    drillDownPaths: [],
  };
}

/**
 * Transform user statistics into DrillDownDataItem format
 */
function transformStatsToDrillDownItems(
  stats: UserStatistics,
): DrillDownDataItem[] {
  const total = stats.authMethods.reduce((sum, m) => sum + m.count, 0);

  return stats.authMethods.map((method, index) => ({
    id: String(index),
    label: method.method || translate('Unknown'),
    value: method.count,
    percentage: total > 0 ? (method.count / total) * 100 : 0,
    canDrillDown: false, // Could be extended to drill into identity sources
    metadata: {
      method: method.method,
    },
  }));
}

const modeConfig: Record<
  AnalyticsMode,
  { label: string; description: string }
> = {
  'what-if': {
    label: translate('What if'),
    description: translate(
      'Simulate user growth scenarios and federation adoption projections',
    ),
  },
  'why-so': {
    label: translate('Why so'),
    description: translate(
      'Analyze authentication methods and user distribution patterns',
    ),
  },
};

export const UserDemographicsAnalyticsPage: FC = () => {
  const { params } = useCurrentStateAndParams();
  const initialMode = (params.mode as AnalyticsMode) || 'what-if';
  const [activeMode, setActiveMode] = useState<AnalyticsMode>(initialMode);

  const { data, isLoading, error, refetch } = useUserStatistics();

  const capability = useMemo(() => getDemographicsAnalyticsCapability(), []);

  const drillDownData = useMemo(
    () => (data ? transformStatsToDrillDownItems(data) : []),
    [data],
  );

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error || !data) {
    return <LoadingErred loadData={refetch} />;
  }

  const breadcrumbs = useMemo(
    () => [{ key: 'analytics', text: translate('Analytics'), active: true }],
    [],
  );

  return (
    <>
      <ReportingTitle
        reportKey="reporting-user-demographics-analytics"
        backState="reporting-user-demographics"
        additionalBreadcrumbs={breadcrumbs}
      />

      <AnalyticsPageContent
        activeMode={activeMode}
        setActiveMode={setActiveMode}
        capability={capability}
        data={data}
        drillDownData={drillDownData}
        modeConfig={modeConfig}
      />
    </>
  );
};
