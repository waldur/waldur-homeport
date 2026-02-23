import { useQuery } from '@tanstack/react-query';
import { useCurrentStateAndParams } from '@uirouter/react';
import { FC, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  marketplacePlansUsageStatsList,
  PlanUsageResponse,
} from 'waldur-js-client';

import { Link } from '@waldur/core/Link';
import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { PublicDashboardHero } from '@waldur/dashboard/hero/PublicDashboardHero';
import { translate } from '@waldur/i18n';
import { useTitle } from '@waldur/navigation/title';
import { selectPlanUsageFilter } from '@waldur/table/generated/PlanUsageFilter';

import { AnalyticsMode, AnalyticsPageContent } from '../analytics';
import { useReportBreadcrumbs } from '../ReportsBreadcrumbs';

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
  useTitle(translate('Capacity Analysis'));

  const { params } = useCurrentStateAndParams();
  const initialMode = (params.mode as AnalyticsMode) || 'what-if';
  const [activeMode, setActiveMode] = useState<AnalyticsMode>(initialMode);

  // Get filter values from the form if available
  const filter = useSelector(selectPlanUsageFilter);

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

  // Set up breadcrumbs with dropdown for switching reports
  useReportBreadcrumbs({
    currentReport: 'capacity',
    category: 'provider',
    additionalItems: [
      {
        key: 'analytics',
        text: translate('Analytics'),
        active: true,
      },
    ],
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <LoadingErred loadData={refetch} />;
  }

  return (
    <>
      <PublicDashboardHero
        containerClassName="mb-5"
        cardBordered
        hideQuickSection
        title={
          <div className="d-flex flex-wrap align-items-center gap-3">
            <h3 className="mb-0">{translate('Capacity Analysis')}</h3>
          </div>
        }
        actions={
          <Link state="reporting-capacity" className="btn btn-light btn-sm">
            {translate('Back to Capacity')}
          </Link>
        }
      >
        <p className="text-muted mb-0">
          {translate(
            'Analyze capacity usage patterns and explore scenarios for resource planning.',
          )}
        </p>
      </PublicDashboardHero>

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
