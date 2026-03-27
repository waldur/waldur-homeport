import { DateTime } from 'luxon';
import { FC, useState } from 'react';
import { Nav, Tab } from 'react-bootstrap';

import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { NoResult } from '@waldur/navigation/header/search/NoResult';

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
          <Tab.Container
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k as MaintenanceViewTab)}
          >
            <Nav
              variant="tabs"
              className="nav-line-tabs flex-nowrap mb-6 border-0"
            >
              <Nav.Item>
                <Nav.Link as="button" eventKey="table">
                  {translate('Table')}
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link as="button" eventKey="timeline">
                  {translate('Timeline')}
                </Nav.Link>
              </Nav.Item>
            </Nav>

            <Tab.Content>
              <Tab.Pane eventKey="table" mountOnEnter unmountOnExit>
                <MaintenanceTableView announcements={announcements} />
              </Tab.Pane>
              <Tab.Pane eventKey="timeline" mountOnEnter unmountOnExit>
                <MaintenanceTimelineView announcements={announcements} />
              </Tab.Pane>
            </Tab.Content>
          </Tab.Container>
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
