import { useQuery } from '@tanstack/react-query';
import { useCurrentStateAndParams } from '@uirouter/react';
import { FC, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  marketplacePlansUsageStatsList,
  PlanUsageResponse,
} from 'waldur-js-client';

import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { selectMarketplacePlansUsageStatsFilter } from '@/table/generated/MarketplacePlansUsageStatsFilter';

import { AnalyticsMode, AnalyticsPageContent } from '../analytics';
import { ReportingTitle } from '../ReportingTitle';

import {
  getCapacityAnalyticsCapability,
  transformToDrillDownData,
} from './PlanUsageAnalytics';

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

export const CapacityAnalyticsPage: FC = () => {
  const { params } = useCurrentStateAndParams();
  const initialMode = (params.mode as AnalyticsMode) || 'what-if';
  const [activeMode, setActiveMode] = useState<AnalyticsMode>(initialMode);

  // Get filter values from the form if available
  const filter = useSelector(selectMarketplacePlansUsageStatsFilter);

  // Fetch plan usage data
  const {
    data: planUsages,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['CapacityAnalytics', filter],
    queryFn: async () => {
      const response = await marketplacePlansUsageStatsList({
        query: filter,
      });
      return response.data as PlanUsageResponse[];
    },
  });

  const capability = useMemo(
    () => getCapacityAnalyticsCapability(planUsages || []),
    [planUsages],
  );

  // Transform data for WhySoDrillDown - group by provider initially
  const drillDownData = useMemo(
    () => transformToDrillDownData(planUsages || [], 'provider'),
    [planUsages],
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
        reportKey="reporting-capacity-analytics"
        backState="reporting-capacity"
        additionalBreadcrumbs={breadcrumbs}
      />

      <AnalyticsPageContent
        activeMode={activeMode}
        setActiveMode={setActiveMode}
        capability={capability}
        data={planUsages}
        drillDownData={drillDownData}
        modeConfig={modeConfig}
      />
    </>
  );
};
