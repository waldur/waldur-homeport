import { DateTime } from 'luxon';
import { FC, useState } from 'react';

import { Tabs, TabsList, TabsTrigger, TabsContent } from 'waldur-ui';

import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { NoResult } from '@/navigation/header/search/NoResult';

import { ReportingTitle } from '../ReportingTitle';

import { MaintenanceReportingFilter } from './MaintenanceReportingFilter';
import { MaintenanceSummaryCards } from './MaintenanceSummaryCards';
import { MaintenanceFilterState, MaintenanceViewTab } from './types';
import { useMaintenanceStats } from './useMaintenanceStats';
import { useMaintenanceStatsAggregated } from './useMaintenanceStatsAggregated';
import { MaintenanceTableView } from './views/MaintenanceTableView';
import { MaintenanceTimelineView } from './views/MaintenanceTimelineView';

// Default date range: last 90 days to 30 days in the future
const getDefaultDateRange = () => ({
  startDate: DateTime.now().minus({ days: 90 }).toISODate()!,
  endDate: DateTime.now().plus({ days: 30 }).toISODate()!,
});

export const MaintenanceReportingOverviewPage: FC = () => {
  const [filter, setFilter] =
    useState<MaintenanceFilterState>(getDefaultDateRange);
  const [activeTab, setActiveTab] = useState<MaintenanceViewTab>('table');

  const handleFilterChange = (partial: Partial<MaintenanceFilterState>) => {
    setFilter((prev) => ({ ...prev, ...partial }));
  };

  const { isLoading, error, refetch, announcements } =
    useMaintenanceStats(filter);

  const {
    isLoading: statsLoading,
    error: statsError,
    stats,
  } = useMaintenanceStatsAggregated({
    startDate: filter.startDate,
    endDate: filter.endDate,
    providerUuid: filter.providerUuid,
  });

  const loading = isLoading || statsLoading;
  const hasError = error || statsError;

  return (
    <>
      <ReportingTitle reportKey="maintenance-overview">
        <MaintenanceReportingFilter
          filter={filter}
          onFilterChange={handleFilterChange}
        />
      </ReportingTitle>

      {loading ? (
        <LoadingSpinner />
      ) : hasError ? (
        <LoadingErred loadData={refetch} />
      ) : announcements?.length ? (
        <>
          {stats && <MaintenanceSummaryCards stats={stats} />}
          <Tabs
            mount="active"
            value={activeTab}
            onValueChange={(k) => setActiveTab(k as MaintenanceViewTab)}
          >
            <TabsList bordered={false} className="mb-6">
              <TabsTrigger value="table">{translate('Table')}</TabsTrigger>
              <TabsTrigger value="timeline">
                {translate('Timeline')}
              </TabsTrigger>
            </TabsList>

            <>
              <TabsContent value="table">
                <MaintenanceTableView announcements={announcements} />
              </TabsContent>
              <TabsContent value="timeline">
                <MaintenanceTimelineView announcements={announcements} />
              </TabsContent>
            </>
          </Tabs>
        </>
      ) : (
        <NoResult
          title={translate('No maintenance data')}
          message={translate(
            'No maintenance announcements found for the selected period.',
          )}
          noAction
        />
      )}
    </>
  );
};
