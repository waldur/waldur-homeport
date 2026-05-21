import { useQuery } from '@tanstack/react-query';
import { useCurrentStateAndParams } from '@uirouter/react';
import { FC, useMemo, useState } from 'react';
import { Form, useFormState } from 'react-final-form';
import { customerQuotasList } from 'waldur-js-client';

import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import {
  selectCustomerQuotasFilter,
  CustomerQuotasFilterFormId,
} from '@/table/generated/CustomerQuotasFilter';

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

import { CustomerQuota } from './types';

/**
 * Simulation parameters for Quota "What if" analysis
 */
const quotaSimulationParams: SimulationParam[] = [
  {
    id: 'quotaChangePercent',
    label: translate('Quota adjustment'),
    description: translate('Change all quota limits by percentage'),
    type: 'slider',
    defaultValue: 0,
    min: -50,
    max: 100,
    step: 10,
    unit: '%',
  },
  {
    id: 'growthScenario',
    label: translate('Growth scenario'),
    description: translate('Expected resource growth pattern'),
    type: 'select',
    defaultValue: 'moderate',
    options: [
      { value: 'conservative', label: translate('Conservative (5%)') },
      { value: 'moderate', label: translate('Moderate (15%)') },
      { value: 'aggressive', label: translate('Aggressive (30%)') },
    ],
  },
  {
    id: 'thresholdPercent',
    label: translate('Warning threshold'),
    description: translate('Alert when usage exceeds this percentage'),
    type: 'number',
    defaultValue: 80,
    min: 50,
    max: 100,
    step: 5,
    unit: '%',
  },
];

/**
 * MOCKED: Growth rate multipliers for scenario projections
 */
const GROWTH_RATES = {
  conservative: 0.05,
  moderate: 0.15,
  aggressive: 0.3,
};

/**
 * MOCKED: Simulated quota limits per customer
 */
function getMockedQuotaLimits(quotas: CustomerQuota[]): Map<string, number> {
  const limits = new Map<string, number>();
  quotas.forEach((q) => {
    limits.set(q.customer_name, q.value > 0 ? Math.ceil(q.value * 1.2) : 100);
  });
  return limits;
}

/**
 * Calculate simulation results for Quota "What if" analysis
 */
function calculateQuotaSimulation(
  params: Record<string, number | string>,
  data: unknown,
): SimulationResult[] {
  const quotas = data as CustomerQuota[];
  if (!quotas || quotas.length === 0) return [];

  const quotaChange = Number(params.quotaChangePercent) / 100;
  const growthRate = GROWTH_RATES[params.growthScenario as string] || 0.15;
  const threshold = Number(params.thresholdPercent) / 100;

  const mockedLimits = getMockedQuotaLimits(quotas);

  let totalValue = 0;
  let totalLimit = 0;
  let customersAboveThreshold = 0;

  quotas.forEach((q) => {
    totalValue += q.value;
    const limit = mockedLimits.get(q.customer_name) || 100;
    totalLimit += limit;

    const utilization = limit > 0 ? q.value / limit : 0;
    if (utilization >= threshold) {
      customersAboveThreshold++;
    }
  });

  const projectedValue = Math.round(totalValue * (1 + growthRate));
  const projectedLimit = Math.round(totalLimit * (1 + quotaChange));
  const projectedRemaining = projectedLimit - projectedValue;

  let projectedAboveThreshold = 0;
  quotas.forEach((q) => {
    const limit = mockedLimits.get(q.customer_name) || 100;
    const newValue = Math.round(q.value * (1 + growthRate));
    const newLimit = Math.round(limit * (1 + quotaChange));
    const utilization = newLimit > 0 ? newValue / newLimit : 0;
    if (utilization >= threshold) {
      projectedAboveThreshold++;
    }
  });

  const currentUtilization =
    totalLimit > 0 ? (totalValue / totalLimit) * 100 : 0;
  const projectedUtilization =
    projectedLimit > 0 ? (projectedValue / projectedLimit) * 100 : 0;

  return [
    createSimulationResult(
      'total-usage',
      translate('Total quota usage'),
      totalValue,
      projectedValue,
    ),
    createSimulationResult(
      'total-limit',
      translate('Total quota limit'),
      totalLimit,
      projectedLimit,
    ),
    createSimulationResult(
      'total-remaining',
      translate('Available quota'),
      totalLimit - totalValue,
      projectedRemaining,
    ),
    createSimulationResult(
      'utilization',
      translate('Overall utilization'),
      Math.round(currentUtilization),
      Math.round(projectedUtilization),
      '%',
    ),
    createSimulationResult(
      'above-threshold',
      translate('Organizations above threshold'),
      customersAboveThreshold,
      projectedAboveThreshold,
    ),
  ];
}

function getQuotasAnalyticsCapability(): AnalyticsCapability {
  return {
    supportedModes: ['what-if', 'why-so'],
    simulationParams: quotaSimulationParams,
    calculateSimulation: calculateQuotaSimulation,
    initialDimension: translate('Organization'),
    drillDownPaths: [],
  };
}

/**
 * Transform quota data into DrillDownDataItem format for WhySoDrillDown
 */
function transformQuotasToDrillDownItems(
  quotas: CustomerQuota[],
): DrillDownDataItem[] {
  if (!quotas || quotas.length === 0) return [];

  const total = quotas.reduce((sum, q) => sum + q.value, 0);

  return quotas.map((quota, index) => ({
    id: String(index),
    label: quota.customer_name,
    value: quota.value,
    percentage: total > 0 ? (quota.value / total) * 100 : 0,
    canDrillDown: false, // No drill-down available for quotas yet
    metadata: {
      quotaName: quota.customer_name,
    },
    // Mocked change indicators for demonstration
    change: {
      value: Math.round((Math.random() - 0.5) * quota.value * 0.2),
      percent: Math.round((Math.random() - 0.5) * 20),
      direction: (Math.random() > 0.5 ? 'up' : 'down') as 'up' | 'down',
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
      'Explore scenarios by adjusting parameters to see projected outcomes',
    ),
  },
  'why-so': {
    label: translate('Why so'),
    description: translate(
      'Drill down into data to understand root causes and contributing factors',
    ),
  },
};

const QuotasAnalyticsPageTable: FC = () => {
  const { params } = useCurrentStateAndParams();
  const initialMode = (params.mode as AnalyticsMode) || 'what-if';
  const [activeMode, setActiveMode] = useState<AnalyticsMode>(initialMode);

  const { values } = useFormState();
  const formValues = useMemo(
    () => selectCustomerQuotasFilter(values),
    [values],
  );

  // Fetch quota data
  const {
    data: quotas,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['QuotasAnalytics', formValues?.quota_name],
    queryFn: async () => {
      const response = await customerQuotasList({
        query: {
          quota_name: formValues?.quota_name || 'nc_resource_count',
        },
      });
      return response.data;
    },
  });

  const capability = useMemo(() => getQuotasAnalyticsCapability(), []);

  // Transform quota data for WhySoDrillDown
  const drillDownData = useMemo(
    () => transformQuotasToDrillDownItems(quotas || []),
    [quotas],
  );

  const breadcrumbs = useMemo(
    () => [{ key: 'analytics', text: translate('Analytics'), active: true }],
    [],
  );

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <LoadingErred loadData={refetch} />;
  }

  return (
    <>
      <ReportingTitle
        reportKey="reporting-quotas-analytics"
        backState="reporting-quotas"
        additionalBreadcrumbs={breadcrumbs}
      />

      <AnalyticsPageContent
        activeMode={activeMode}
        setActiveMode={setActiveMode}
        capability={capability}
        data={quotas}
        drillDownData={drillDownData}
        modeConfig={modeConfig}
      />
    </>
  );
};

export const QuotasAnalyticsPage: FC<any> = (props) => (
  <Form
    id={CustomerQuotasFilterFormId}
    onSubmit={() => {}}
    subscription={{
      values: true,
    }}
  >
    {() => <QuotasAnalyticsPageTable {...props} />}
  </Form>
);
